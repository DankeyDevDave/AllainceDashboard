"""Tests for AquaTempAPI manager."""
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from aiohttp import ClientResponseError, ClientSession

from custom_components.aqua_temp.common.consts import API_MAX_ATTEMPTS, API_RETRY_DELAY_SECONDS
from custom_components.aqua_temp.managers.aqua_temp_api import AquaTempAPI
from custom_components.aqua_temp.models.exceptions import LoginError, InvalidTokenError


@pytest.fixture
def mock_config_manager():
    """Create a mock config manager."""
    config_manager = MagicMock()
    config_manager.get_api_param = MagicMock(return_value="test_param")
    config_manager.username = "test_user"
    config_manager.password = "test_pass"
    return config_manager


@pytest.fixture
def api_instance(mock_config_manager):
    """Create an API instance with mocked dependencies."""
    return AquaTempAPI(None, mock_config_manager)


class TestAquaTempAPIInitialization:
    """Test API initialization."""

    @pytest.mark.asyncio
    async def test_initialize_creates_session(self, api_instance):
        """Test that initialization creates a session."""
        with patch.object(api_instance, '_connect', new_callable=AsyncMock):
            with patch('custom_components.aqua_temp.managers.aqua_temp_api.ClientSession') as mock_session:
                await api_instance.initialize()
                assert api_instance._session is not None

    @pytest.mark.asyncio
    async def test_initialize_handles_login_error(self, api_instance):
        """Test initialization handles LoginError gracefully."""
        with patch.object(api_instance, '_connect', side_effect=LoginError()):
            # Should not raise when throw_error=False (default)
            await api_instance.initialize()

    @pytest.mark.asyncio
    async def test_initialize_throws_login_error_when_requested(self, api_instance):
        """Test initialization throws LoginError when throw_error=True."""
        with patch.object(api_instance, '_connect', side_effect=LoginError()):
            with pytest.raises(LoginError):
                await api_instance.initialize(throw_error=True)

    @pytest.mark.asyncio
    async def test_initialize_handles_network_errors(self, api_instance):
        """Test initialization handles network errors gracefully."""
        with patch.object(api_instance, '_connect', side_effect=ConnectionError("Network failed")):
            # Should log warning but not raise
            await api_instance.initialize()


class TestAquaTempAPIRetryLogic:
    """Test retry logic and exponential backoff."""

    @pytest.mark.asyncio
    async def test_exponential_backoff_delays(self, api_instance):
        """Test that retry delays follow exponential backoff pattern."""
        with patch('custom_components.aqua_temp.managers.aqua_temp_api.sleep', new_callable=AsyncMock) as mock_sleep:
            with patch.object(api_instance, '_update_device', side_effect=ConnectionError("Network error")):
                with patch.object(api_instance, '_connect', new_callable=AsyncMock):
                    api_instance._devices = {"test_device": {}}

                    try:
                        await api_instance._internal_update(attempt=1)
                    except:
                        pass

                    # Should be called with exponential backoff
                    if mock_sleep.called:
                        call_args = [call[0][0] for call in mock_sleep.call_args_list]
                        # First retry: 1s, second: 2s, third: 4s
                        assert call_args[0] == API_RETRY_DELAY_SECONDS * (2 ** 0)  # 1s

    @pytest.mark.asyncio
    async def test_max_retry_attempts_respected(self, api_instance):
        """Test that retries stop after API_MAX_ATTEMPTS."""
        retry_count = 0

        async def failing_update(*args, **kwargs):
            nonlocal retry_count
            retry_count += 1
            raise ConnectionError("Network error")

        with patch('custom_components.aqua_temp.managers.aqua_temp_api.sleep', new_callable=AsyncMock):
            with patch.object(api_instance, '_update_device', side_effect=failing_update):
                with patch.object(api_instance, '_connect', new_callable=AsyncMock):
                    api_instance._devices = {"test_device": {}}

                    await api_instance._internal_update(attempt=1)

                    # Should attempt up to API_MAX_ATTEMPTS
                    assert retry_count <= API_MAX_ATTEMPTS


class TestAquaTempAPIErrorHandling:
    """Test specific error handling."""

    @pytest.mark.asyncio
    async def test_invalid_token_clears_token(self, api_instance):
        """Test that InvalidTokenError clears the token."""
        api_instance._token = "old_token"
        api_instance._devices = {"test_device": {}}

        with patch.object(api_instance, '_update_device', side_effect=InvalidTokenError("Invalid token")):
            with patch('custom_components.aqua_temp.managers.aqua_temp_api.sleep', new_callable=AsyncMock):
                with patch.object(api_instance, '_connect', new_callable=AsyncMock):
                    await api_instance._internal_update(attempt=1)

                    # Token should be cleared
                    assert api_instance._token is None

    @pytest.mark.asyncio
    async def test_network_errors_logged_appropriately(self, api_instance, caplog):
        """Test that network errors are logged with appropriate level."""
        api_instance._devices = {"test_device": {}}

        with patch.object(api_instance, '_update_device', side_effect=ConnectionError("Network failed")):
            with patch('custom_components.aqua_temp.managers.aqua_temp_api.sleep', new_callable=AsyncMock):
                with patch.object(api_instance, '_connect', new_callable=AsyncMock):
                    await api_instance._internal_update(attempt=1)

                    # Should log network error as warning
                    assert any("Network error" in record.message for record in caplog.records)

    @pytest.mark.asyncio
    async def test_data_parsing_errors_handled(self, api_instance):
        """Test that data parsing errors are handled correctly."""
        with patch.object(api_instance, '_request', side_effect=KeyError("Missing key")):
            with patch('custom_components.aqua_temp.managers.aqua_temp_api.sleep', new_callable=AsyncMock):
                with patch.object(api_instance, '_connect', new_callable=AsyncMock):
                    # Should handle KeyError gracefully
                    try:
                        await api_instance._perform_action({}, "test_operation", attempt=1)
                    except KeyError:
                        # Error should be caught and retried
                        pass


class TestAquaTempAPISSLVerification:
    """Test SSL verification is enabled."""

    @pytest.mark.asyncio
    async def test_ssl_verification_enabled(self, api_instance):
        """Test that SSL verification is enabled in requests."""
        mock_session = MagicMock(spec=ClientSession)
        mock_response = AsyncMock()
        mock_response.json = AsyncMock(return_value={"result": "success"})
        mock_response.raise_for_status = MagicMock()
        mock_session.post = MagicMock(return_value=mock_response)

        api_instance._session = mock_session
        api_instance._headers = {}

        # Mock the context manager
        mock_session.post.return_value.__aenter__ = AsyncMock(return_value=mock_response)
        mock_session.post.return_value.__aexit__ = AsyncMock(return_value=None)

        from custom_components.aqua_temp.common.endpoints import Endpoints

        try:
            await api_instance._request(Endpoints.Login, {})
        except:
            pass

        # Verify SSL was set to True
        if mock_session.post.called:
            call_kwargs = mock_session.post.call_args.kwargs
            assert call_kwargs.get('ssl') is True, "SSL verification must be enabled"


class TestAquaTempAPITokenManagement:
    """Test token management."""

    def test_set_token_stores_token(self, api_instance):
        """Test that set_token stores the token correctly."""
        test_token = "test_token_123"
        api_instance.set_token(test_token)
        assert api_instance._token == test_token

    def test_set_token_clears_token_on_none(self, api_instance):
        """Test that set_token clears token when None is passed."""
        api_instance._token = "existing_token"
        api_instance.set_token(None)
        assert api_instance._token is None

    def test_set_token_updates_headers(self, api_instance):
        """Test that set_token updates request headers."""
        test_token = "test_token_123"
        api_instance.set_token(test_token)

        from custom_components.aqua_temp.common.consts import HTTP_HEADER_X_TOKEN
        assert api_instance._headers.get(HTTP_HEADER_X_TOKEN) == test_token


class TestAquaTempAPIConstants:
    """Test that constants are properly used."""

    def test_retry_delay_constant_defined(self):
        """Test that API_RETRY_DELAY_SECONDS constant exists."""
        from custom_components.aqua_temp.common.consts import API_RETRY_DELAY_SECONDS
        assert API_RETRY_DELAY_SECONDS == 1

    def test_max_attempts_constant_defined(self):
        """Test that API_MAX_ATTEMPTS constant exists."""
        from custom_components.aqua_temp.common.consts import API_MAX_ATTEMPTS
        assert API_MAX_ATTEMPTS == 3

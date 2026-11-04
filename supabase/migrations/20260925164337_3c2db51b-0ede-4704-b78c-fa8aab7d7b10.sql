GRANT USAGE ON SCHEMA private TO anon, authenticated;
GRANT EXECUTE ON FUNCTION private.submit_issue(TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION private.get_thread_by_code(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION private.reply_to_thread(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION private.has_role(UUID, public.app_role) TO authenticated;
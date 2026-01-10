-- Enable RLS on push_subscriptions
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to insert their own subscription
CREATE POLICY "Users can insert their own push_subscriptions"
ON push_subscriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to view their own subscription
CREATE POLICY "Users can view their own push_subscriptions"
ON push_subscriptions FOR SELECT
USING (auth.uid() = user_id);

-- Policy to allow users to delete their own subscription
CREATE POLICY "Users can delete their own push_subscriptions"
ON push_subscriptions FOR DELETE
USING (auth.uid() = user_id);

-- Policy to allow users to update their own subscription
CREATE POLICY "Users can update their own push_subscriptions"
ON push_subscriptions FOR UPDATE
USING (auth.uid() = user_id);

-- Grant access to authenticated users
GRANT ALL ON push_subscriptions TO authenticated;
GRANT ALL ON push_subscriptions TO service_role;

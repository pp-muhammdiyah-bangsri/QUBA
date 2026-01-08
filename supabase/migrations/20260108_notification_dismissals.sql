-- Migration: Notification System Improvements
-- Run this in Supabase SQL Editor

-- 1. Add target_santri_id column to notifications table (for santri-specific notifications)
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS target_santri_id UUID REFERENCES santri(id) ON DELETE CASCADE;

-- Index for faster santri-based lookups
CREATE INDEX IF NOT EXISTS idx_notifications_target_santri ON notifications(target_santri_id);

-- 2. Create notification_dismissals table (persistent dismissal)
CREATE TABLE IF NOT EXISTS notification_dismissals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    dismissed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, notification_id)
);

-- Enable RLS
ALTER TABLE notification_dismissals ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see/manage their own dismissals
CREATE POLICY "Users can view own dismissals" ON notification_dismissals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dismissals" ON notification_dismissals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own dismissals" ON notification_dismissals
    FOR DELETE USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_notification_dismissals_user ON notification_dismissals(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_dismissals_notification ON notification_dismissals(notification_id);

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Workflow } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db: Database.Database;

export function initDatabase(): void {
  const dbPath = path.join(__dirname, '../../data/workflows.db');
  db = new Database(dbPath);

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS workflows (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL DEFAULT 'fetching_transcript',
      zoom_meeting_id TEXT NOT NULL,
      organizer_email TEXT NOT NULL,
      meeting_topic TEXT NOT NULL DEFAULT '',
      transcript TEXT,
      user_context TEXT,
      summary TEXT,
      selected_company_id TEXT,
      selected_company_name TEXT,
      teams_conversation_ref TEXT,
      error_message TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_workflows_meeting_id ON workflows(zoom_meeting_id);
    CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);

    CREATE TABLE IF NOT EXISTS teams_users (
      email TEXT PRIMARY KEY,
      conversation_ref TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

export function getDb(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export function createWorkflow(data: {
  id: string;
  zoom_meeting_id: string;
  organizer_email: string;
  meeting_topic: string;
}): Workflow {
  const stmt = getDb().prepare(`
    INSERT INTO workflows (id, zoom_meeting_id, organizer_email, meeting_topic)
    VALUES (@id, @zoom_meeting_id, @organizer_email, @meeting_topic)
  `);
  stmt.run(data);
  return getWorkflow(data.id)!;
}

export function getWorkflow(id: string): Workflow | null {
  const stmt = getDb().prepare('SELECT * FROM workflows WHERE id = ?');
  return (stmt.get(id) as Workflow) ?? null;
}

export function getWorkflowByMeetingId(meetingId: string): Workflow | null {
  const stmt = getDb().prepare('SELECT * FROM workflows WHERE zoom_meeting_id = ?');
  return (stmt.get(meetingId) as Workflow) ?? null;
}

export function updateWorkflow(id: string, updates: Partial<Omit<Workflow, 'id' | 'created_at'>>): void {
  const fields = Object.keys(updates).filter(k => k !== 'id' && k !== 'created_at');
  if (fields.length === 0) return;

  const setClause = fields.map(f => `${f} = @${f}`).join(', ');
  const stmt = getDb().prepare(`
    UPDATE workflows SET ${setClause}, updated_at = datetime('now') WHERE id = @id
  `);
  stmt.run({ ...updates, id });
}

export function saveTeamsUser(email: string, conversationRef: string): void {
  const stmt = getDb().prepare(`
    INSERT INTO teams_users (email, conversation_ref)
    VALUES (@email, @conversation_ref)
    ON CONFLICT(email) DO UPDATE SET
      conversation_ref = @conversation_ref,
      updated_at = datetime('now')
  `);
  stmt.run({ email, conversation_ref: conversationRef });
}

export function getTeamsUser(email: string): string | null {
  const stmt = getDb().prepare('SELECT conversation_ref FROM teams_users WHERE email = ?');
  const row = stmt.get(email) as { conversation_ref: string } | undefined;
  return row?.conversation_ref ?? null;
}

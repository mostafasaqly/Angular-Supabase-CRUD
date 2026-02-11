import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TasksService } from '../tasks.service';
import { Task } from '../tasks.models';
import { AuthService } from '../../../core/auth/auth.service';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../../../core/supabase.client';

@Component({
  selector: 'app-tasks-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tasks-page.html',
  styleUrl: './tasks-page.scss',
})
export class TasksPageComponent implements OnDestroy {
  private api = inject(TasksService);
  auth = inject(AuthService);
  private channel?: RealtimeChannel;



  tasks = signal<Task[]>([]);
  loading = signal(false);
  error = signal('');

  newTitle = signal('');

  adding = signal(false);
  togglingId = signal<string | null>(null);
  deletingId = signal<string | null>(null);

  hasTasks = computed(() => this.tasks().length > 0);
  isEmpty = computed(() => !this.loading() && this.tasks().length === 0);



  constructor() {
    this.load();
    this.startRealtime();
  }
  ngOnDestroy(): void {
    this.stopRealtime();
  }

  async load() {
    if (this.loading()) return;

    this.error.set('');
    this.loading.set(true);

    const { data, error } = await this.api.list();

    this.loading.set(false);

    if (error) {
      this.error.set(error.message);
      this.tasks.set([]);
      return;
    }

    this.tasks.set(data ?? []);
    if (!this.channel) this.startRealtime();

  }
  startRealtime() {
  this.stopRealtime();

  const uid = this.auth.user()?.id;
  if (!uid) return;

  const cfg = {
    schema: 'public',
    table: 'tasks',
    filter: `user_id=eq.${uid}`,
  } as const;

  this.channel = supabase
    .channel(`tasks-${uid}`)
    .on('postgres_changes', { ...cfg, event: 'INSERT' }, () => this.load())
    .on('postgres_changes', { ...cfg, event: 'UPDATE' }, () => this.load())
    .on('postgres_changes', { ...cfg, event: 'DELETE' }, () => this.load())
    .subscribe();
}


  stopRealtime() {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = undefined;
    }
  }

  async add() {
    const title = this.newTitle().trim();
    if (!title || this.adding()) return;

    this.error.set('');
    this.adding.set(true);

    const tempId = `temp-${crypto.randomUUID?.() ?? Math.random().toString(16).slice(2)}`;
    const temp: Task = {
      id: tempId,
      title,
      done: false,
      created_at: new Date().toISOString(),
    };

    this.tasks.set([temp, ...this.tasks()]);
    this.newTitle.set('');

    const { data, error } = await this.api.create({ title });

    this.adding.set(false);

    if (error || !data) {
      // rollback
      this.tasks.set(this.tasks().filter(t => t.id !== tempId));
      this.error.set(error?.message ?? 'Create failed');
      return;
    }

    // replace temp with real row
    this.tasks.set(this.tasks().map(t => (t.id === tempId ? data : t)));
  }

  async toggle(t: Task) {
    if (this.togglingId() === t.id) return;

    this.error.set('');
    this.togglingId.set(t.id);

    const next = !t.done;

    // optimistic update
    this.tasks.set(this.tasks().map(x => (x.id === t.id ? { ...x, done: next } : x)));

    const { error } = await this.api.update(t.id, { done: next });

    this.togglingId.set(null);

    if (error) {
      // rollback
      this.tasks.set(this.tasks().map(x => (x.id === t.id ? { ...x, done: !next } : x)));
      this.error.set(error.message);
    }
  }

  async del(t: Task) {
    if (this.deletingId() === t.id) return;

    this.error.set('');
    const ok = confirm(`Delete "${t.title}"?`);
    if (!ok) return;

    this.deletingId.set(t.id);

    // optimistic remove
    const prev = this.tasks();
    this.tasks.set(prev.filter(x => x.id !== t.id));

    const { data, error } = await this.api.remove(t.id);

    // لو data رجعت فاضية، يبقى مفيش row اتحذف (مثلاً مش بتاعك أو اتشال قبل كده)
    if (!error && (!data || data.length === 0)) {
      // رجع الليست القديمة علشان واضح إن اللي حصل مش delete فعلي
      this.tasks.set(prev);
      this.error.set('Delete did not remove any row (already deleted or not allowed).');
      return;
    }


    this.deletingId.set(null);

    if (error) {
      // rollback
      this.tasks.set(prev);
      this.error.set(error.message);
    }
  }


}

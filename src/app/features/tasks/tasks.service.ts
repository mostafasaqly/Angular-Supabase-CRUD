import { Injectable } from '@angular/core';
import { supabase } from '../../core/supabase.client';
import type { Task, TaskCreate, TaskUpdate } from './tasks.models';

@Injectable({ providedIn: 'root' })
export class TasksService {
  list() {
    return supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false }) as unknown as Promise<{
      data: Task[] | null;
      error: { message: string } | null;
    }>;
  }

  async create(payload: TaskCreate) {
    const res = await supabase
      .from('tasks')
      .insert(payload)
      .select()
      .single();

    return res as unknown as {
      data: Task | null;
      error: { message: string } | null;
    };
  }

  update(id: string, patch: TaskUpdate) {
    return supabase
      .from('tasks')
      .update(patch)
      .eq('id', id) as unknown as Promise<{
      data: Task[] | null;
      error: { message: string } | null;
    }>;
  }

  remove(id: string) {
  return supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .select() as unknown as Promise<{
      data: Task[] | null;
      error: { message: string } | null;
    }>;
}

}

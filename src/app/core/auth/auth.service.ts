import { Injectable, signal } from '@angular/core';
import { supabase } from '../supabase.client';
import type { Session, User } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class AuthService {
  user = signal<User | null>(null);
  session = signal<Session | null>(null);
  loading = signal(false);
  error = signal('');
  ready = signal(false);


  constructor() {
    supabase.auth.getSession().then(({ data }) => {
      this.session.set(data.session ?? null);
      this.user.set(data.session?.user ?? null);
      this.ready.set(true);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      this.session.set(session);
      this.user.set(session?.user ?? null);
      this.ready.set(true);
    });
  }

  async signUp(email: string, password: string) {
    this.error.set('');
    this.loading.set(true);

    const { data, error } = await supabase.auth.signUp({ email, password });

    this.loading.set(false);

    if (error) {
      this.error.set(error.message);
      return false;
    }

    this.session.set(data.session ?? null);
    this.user.set(data.user ?? null);
    return true;
  }

  async signIn(email: string, password: string) {
    this.error.set('');
    this.loading.set(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    this.loading.set(false);

    if (error) {
      this.error.set(error.message);
      return false;
    }

    this.session.set(data.session ?? null);
    this.user.set(data.user ?? null);
    return true;
  }

  async signOut() {
    this.error.set('');
    await supabase.auth.signOut();
    this.session.set(null);
    this.user.set(null);
  }
  async updatePassword(newPassword: string) {
  this.error.set('');

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    this.error.set(error.message);
    return { data: null, error };
  }

  return { data, error: null };
}

}

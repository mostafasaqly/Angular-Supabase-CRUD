import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TasksService } from '../../tasks/tasks.service';
import { Task } from '../../tasks/tasks.models';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-overview-page',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './overview-page.html',
  styleUrl: './overview-page.scss',
})
export class OverviewPageComponent {
  private api = inject(TasksService);

  tasks = signal<Task[]>([]);
  loading = signal(false);
  error = signal('');

  total = computed(() => this.tasks().length);
  done = computed(() => this.tasks().filter(t => t.done).length);
  pending = computed(() => this.total() - this.done());

  doneRatio = computed(() => {
    const total = this.total();
    if (!total) return 0;
    return this.done() / total;
  });

  recent = computed(() => this.tasks().slice(0, 5));

  constructor() {
    this.load();
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
  }
}

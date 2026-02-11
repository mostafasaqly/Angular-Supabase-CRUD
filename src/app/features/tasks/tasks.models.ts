export type Task = {
  id: string;
  title: string;
  done: boolean;
  created_at: string;
};

export type TaskCreate = {
  title: string;
};

export type TaskUpdate = {
  title?: string;
  done?: boolean;
};

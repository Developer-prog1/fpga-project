export type Health = {
  status: string;
  database?: string;
};

export type Faculty = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count?: { courses: number };
  courses?: Array<{
    id: string;
    code: string;
    title: string;
    credits: number;
    description?: string | null;
  }>;
};

export type Course = {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  credits: number;
  faculty: { id?: string; name: string; slug: string };
};

export type Admin = {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
};

export type Overview = {
  stats: {
    admins: number;
    faculties: number;
    courses: number;
  };
  faculties: Faculty[];
  courses: Course[];
};

create table if not exists feedbacks (
  id text primary key,
  rating integer not null check (rating >= 0 and rating <= 10),
  comment text not null check (length(comment) between 1 and 4000),
  customer_name text,
  customer_email text,
  analysis_status text not null check (analysis_status in ('pending', 'completed', 'failed')),
  sentiment text check (sentiment in ('positive', 'neutral', 'negative')),
  sentiment_score real,
  themes text not null default '[]',
  summary text,
  suggested_action text,
  urgency text check (urgency in ('low', 'medium', 'high')),
  created_at text not null
);

create table if not exists testimonials (
  id text primary key,
  feedback_id text unique references feedbacks(id) on delete set null,
  quote text not null check (length(quote) between 1 and 1000),
  customer_display_name text,
  status text not null check (status in ('draft', 'approved', 'published', 'archived')),
  approved_at text,
  published_at text,
  created_at text not null
);

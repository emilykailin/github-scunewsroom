export function validatePostData({ title, content }: { title: string; content: string }) {
    if (!title.trim()) throw new Error('Title is required');
    if (!content.trim()) throw new Error('Content is required');
    return true;
  }
  
export function log({
  message,
  data,
  type = 'client',
}: {
  message: string;
  data: any;
  type?: 'client' | 'server';
}) {
  if (type === 'client') {
    console.log(message, data);
  } else {
    fetch('/getgather/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, data, type }),
    });
  }
}

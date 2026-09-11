import { useRouteError, isRouteErrorResponse, Link } from 'react-router';

export default function ErrorPage() {
  const error = useRouteError();

  let title = 'An unexpected error occurred';
  let message = 'Something went wrong on our end.';

  console.error('Caught Route Error:', error);

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = '404 - Page Not Found';
      message = "Sorry, the page you're looking for doesn't exist.";
    } else {
      title = `Error ${error.status}`;
      message = error.statusText;
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div style={{ textAlign: 'center', padding: '3rem' }}>
      <h1>{title}</h1>
      <p>{message}</p>
      <Link to="/">Back to Home</Link>
    </div>
  );
}

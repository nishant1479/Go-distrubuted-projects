import React from 'react';
import 'bootstrap/dist/css/bootstrap.css'
import { Container, Alert } from 'react-bootstrap'
import Entries from './components/entries.components'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container className="mt-4">
          <Alert variant="danger">
            <Alert.Heading>Something went wrong!</Alert.Heading>
            <p>Please refresh the page and try again.</p>
            <hr />
            <p className="mb-0">
              Error: {this.state.error?.message || 'Unknown error'}
            </p>
          </Alert>
        </Container>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <div className="App">
        <Container className="mt-4">
          <h1 className="text-center mb-4">Calorie Tracker</h1>
        </Container>
        <Entries />
      </div>
    </ErrorBoundary>
  );
}

export default App;
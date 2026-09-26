import { Component } from "react";
import { ErrorState } from "./PageStates";

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorState message="This view could not be loaded." />;
    }

    return this.props.children;
  }
}

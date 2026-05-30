import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const LoadingSpinner = ({
  label = 'Loading...',
  size = 22,
  inline = false,
  centered = false,
  fullPage = false,
  minHeight,
}) => {
  const content = (
    <>
      <FaSpinner className="spin" size={size} aria-hidden="true" />
      {label ? <span>{label}</span> : null}
    </>
  );

  if (fullPage) {
    return (
      <div className="loading-spinner-wrap full-page" role="status" aria-live="polite">
        {content}
      </div>
    );
  }

  if (inline) {
    return (
      <span className="loading-spinner-wrap inline" role="status" aria-live="polite">
        {content}
      </span>
    );
  }

  if (centered) {
    return (
      <div
        className="loading-spinner-wrap"
        style={minHeight ? { minHeight } : undefined}
        role="status"
        aria-live="polite"
      >
        {content}
      </div>
    );
  }

  return (
    <div className="loading-spinner-wrap" role="status" aria-live="polite">
      {content}
    </div>
  );
};

export const SectionLoading = ({ loading, label = 'Loading...', minHeight = '200px', children }) => {
  if (loading) {
    return <LoadingSpinner centered label={label} minHeight={minHeight} />;
  }

  return children;
};

export default LoadingSpinner;

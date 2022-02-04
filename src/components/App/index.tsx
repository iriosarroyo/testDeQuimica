import React, { useState } from 'react';
import './App.css';
import MyError from 'components/MyError';
import MyErrorContext from 'contexts/Error';
import ContentApp from 'components/ContentApp';

function App() {
  const [error, setError] = useState(undefined);
  return (
    <MyErrorContext.Provider value={setError}>
      <div className="App">
        <ContentApp />
        {error && <MyError error={error} setError={setError} />}
      </div>
    </MyErrorContext.Provider>

  );
}

export default App;

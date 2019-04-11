import React, {Fragment, useState, useEffect, useCallback} from 'react';
import PropTypes from 'prop-types';

const Autocomplete = props => {
  const {getUserPick, fetchSuggestions, suggestions, isLoading} = props;
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [wrapper, wrapperRef] = useWrapperRef(null);

  function useWrapperRef() {
    let wrapperRef = null;
    const ref = useCallback(node => {
      if (node !== null) {
        wrapperRef = node;
        console.log(wrapperRef);
      }
    }, []);

    console.log(wrapperRef);
    return [wrapperRef, ref];
  }

  const onChange = e => {
    const userInputVal = e.currentTarget.value;
    if (fetchSuggestions) {
      fetchSuggestions(userInputVal);
    }
    setActiveSuggestion(0);
    setShowSuggestions(true);
    setUserInput(userInputVal);
  };

  const onClick = e => {
    setActiveSuggestion(0);
    setShowSuggestions(false);
    setUserInput(e.currentTarget.innerText);
    if (getUserPick) getUserPick(activeSuggestion);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClickOutside = e => {
    console.log(wrapper);
    if (wrapper && !wrapper.contains(e.target)) {
      console.log('click outsiede');
      setShowSuggestions(false);
    }
  };

  const onMouseEnter = index => {
    setActiveSuggestion(index);
  };

  const onKeyDown = e => {
    // User pressed the enter key
    if (e.keyCode === 13) {
      setUserInput(suggestions[activeSuggestion]);
      setActiveSuggestion(0);
      setShowSuggestions(false);
      if (getUserPick) getUserPick(activeSuggestion);
    }

    // User pressed the up arrow
    else if (e.keyCode === 38) {
      if (activeSuggestion === 0) {
        return;
      }
      setActiveSuggestion(activeSuggestion - 1);
    }

    // User pressed the down arrow
    else if (e.keyCode === 40) {
      if (activeSuggestion - 1 === suggestions.length) {
        return;
      }
      setActiveSuggestion(activeSuggestion + 1);
    } else if (e.keyCode === 27) {
      setShowSuggestions(false);
    }
  };

  const suggestionsListComponent =
    showSuggestions &&
    userInput &&
    (!isLoading ? (
      <ul className="suggestions" ref={wrapperRef}>
        {suggestions.map((suggestion, index) => {
          let className;

          // Flag the active suggestion with a class
          if (index === activeSuggestion) {
            className = 'suggestion-active';
          }

          return (
            <li
              className={className}
              key={index}
              onClick={onClick}
              onMouseEnter={() => onMouseEnter(index)}>
              {suggestion}
            </li>
          );
        })}
      </ul>
    ) : (
      <div className="suggestions loading">Loading..</div>
    ));

  return (
    <Fragment>
      <input
        className={props.className}
        type="text"
        onChange={onChange}
        onKeyDown={onKeyDown}
        value={userInput}
      />
      {suggestionsListComponent}
    </Fragment>
  );
};

Autocomplete.propTypes = {
  className: PropTypes.string,
  suggestions: PropTypes.array,
  isLoading: PropTypes.bool,
  fetchSuggestions: PropTypes.func,
  getUserPick: PropTypes.func
};

export default Autocomplete;

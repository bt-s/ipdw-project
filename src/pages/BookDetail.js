import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import GoogleMap from '../components/GoogleMap/GoogleMap';
import {withFirebase} from '../components/Firebase';
import UserLabel from '../components/Books/UserLabel';
import RatingStars from '../components/Books/RatingStars';

const BookDetailContainer = props => {
  const [book, setBooks] = useState([]);
  const [owner, setOwner] = useState([]);

  useEffect(() => {
    fetchBookInfo(props.match.params.bookId);
  }, []);

  const fetchOwnerInfo = ownerId => {
    props.firebase
      .user(ownerId)
      .get()
      .then(owner => {
        if (owner.exists) {
          setOwner(owner.data());
        } else {
          console.error('Owner undefined');
        }
      })
      .catch(function(error) {
        console.error('Error getting document:', error);
      });
  };

  const fetchBookInfo = bookId => {
    props.firebase
      .book(bookId)
      .get()
      .then(book => {
        if (book.exists) {
          setBooks(book.data());
          fetchOwnerInfo(book.data().ownerId);
        } else {
          console.error('No such document!');
        }
      })
      .catch(function(error) {
        console.error('Error getting document:', error);
      });
  };

  return (
    <BookDetail
      book={book}
      owner={owner}
      firebase={props.firebase}
      bookId={props.match.params.bookId}
    />
  );
};

const BookDetail = props => {
  const {book, owner, firebase, bookId} = props;
  const requestBook = () => {
    firebase
      .transactions()
      .add({
        providerID: book.ownerId,
        consumerID: firebase.getMyUID(),
        status: 'Ongoing',
        requestTime: new Date().getTime(),
        itemID: bookId,
        type: book.type
      })
      .then(transac => {
        firebase
          .user(firebase.getMyUID())
          .get()
          .then(user =>
            firebase.user(firebase.getMyUID()).update({
              transactions: (user.data().transactions || []).concat(transac.id)
            })
          );
      })
      .catch(() => {
        console.error('Request failed');
      });
  };

  return (
    <div className="book-details-container">
      <div className="book-info-container">
        <div className="book-title">{book.title}</div>
        <div className="author">by {book.author}</div>
        <img className="book-img" src={book.imageUrls} alt={book.title} />
        <RatingStars rating={toString(book.rating)} />
        <div className="header-description">Description </div>
        <div className="service-description">{book.description}</div>
      </div>
      <div className="book-pickup-container">
        <div className="header-pickup">Pickup Location </div>
        <div className="google-map-wrapper">
          <GoogleMap />
        </div>
        <div className="distance">
          {book.location && book.location.lat + ' ' + book.location.lon}
        </div>
        <div className="owner-field">
          <span>Provided by:</span>
          {firebase.getMyUID() !== book.ownerId ? (
            <UserLabel avatarUrl={owner.photoUrl} userName={owner.username} />
          ) : (
            <UserLabel avatarUrl={owner.photoUrl} userName="you" />
          )}
        </div>
      </div>
      {firebase.getMyUID() !== book.ownerId && (
        <button className="btn-request btn" onClick={requestBook}>
          Request
        </button>
      )}
    </div>
  );
};

BookDetail.propTypes = {
  imageUrls: PropTypes.string,
  title: PropTypes.string,
  distance: PropTypes.string,
  description: PropTypes.string,
  userProfile: PropTypes.string,
  rating: PropTypes.string,
  reviewTotal: PropTypes.string,
  author: PropTypes.string,
  timeToPick: PropTypes.string,
  pickupLocation: PropTypes.string
};

const mapStateToProps = state => ({
  books: state.booksState.books,
  authUser: state.sessionState.authUser
});
export default connect(mapStateToProps)(withFirebase(BookDetailContainer));

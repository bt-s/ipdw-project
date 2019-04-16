import React, {useState} from 'react';
import PropTypes from 'prop-types';

import {withFirebase} from '../Firebase';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

import Dropdown from '../Dropdown/Dropdown';
import {uploadPictureToFirebase} from '../../helpers/storageHelper';

const Avatar = props => {
  const [statusText, setStatusText] = useState('Upload a photo...');
  const [imgURL, setImgURL] = useState('');

  const postUploadTask = url => {
    props.firebase.auth.currentUser
      .updateProfile({
        photoUrl: url
      })
      .then(function() {
        setImgURL(url);
        props.firebase.user(props.firebase.getMyUID()).update({photoUrl: url});
      });
  };

  const uploadField = [
    {
      id: 0,
      title: (
        <label>
          {statusText}
          <input
            type="file"
            name=""
            onChange={e => {
              uploadPictureToFirebase(
                e.target.files[0],
                'portrait_images',
                props.firebase,
                postUploadTask,
                status => {
                  setStatusText(status);
                }
              );
            }}
            id=""
            style={{display: 'none'}}
          />
        </label>
      ),
      classes: 'link avatar-upload'
    }
  ];

  return (
    <div className="avatar-container">
      <img
        className="avatar"
        src={imgURL === '' ? props.avatarUrl : imgURL}
        alt=""
      />
      <Dropdown
        classes="edit-avatar"
        headerObject={<FontAwesomeIcon icon="pencil-alt" />}
        headerTitle="Edit"
        items={uploadField}
      />
    </div>
  );
};

Avatar.propTypes = {
  avatarUrl: PropTypes.string
};

export default withFirebase(Avatar);

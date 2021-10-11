import React from "react";
import { Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
interface ConnectionWarningProps {
  canLoad: boolean | undefined;
}

export const LocalHostWarning: React.FC<ConnectionWarningProps> = (props) => {
  //Utils.log("WARNING",props)
  return (
    <>
      <Modal show={true} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
        <Modal.Header>
          <Modal.Title>
        <FontAwesomeIcon icon={faExclamationTriangle} /> Localhost is not supported
        </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            Localhost and remixd are not supported in this app.
        </Modal.Body>
      </Modal>
    </>
  );
};

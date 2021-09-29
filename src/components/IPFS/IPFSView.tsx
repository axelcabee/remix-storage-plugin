import React, { Suspense, useEffect } from "react";
import { useBehaviorSubject } from "../usesubscribe/index";
import {
  boxservice,
  gitservice,
  ipfservice,
  localipfsstorage,
  Utils,
} from "../../App";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { toast } from "react-toastify";

interface IPFSViewProps {}

export const IPFSView: React.FC<IPFSViewProps> = () => {
  const cid = useBehaviorSubject(ipfservice.cidBehavior);
  const boxconnected = useBehaviorSubject(boxservice.status);
  const IPFSStatus = useBehaviorSubject(ipfservice.connectionStatus);
  const PinataStatus = useBehaviorSubject(ipfservice.pinataConnectionStatus);
  const canExport = useBehaviorSubject(gitservice.canExport);

  ipfservice.pinataConnectionStatus.subscribe((x) => {}).unsubscribe();
  ipfservice.connectionStatus.subscribe((x) => {}).unsubscribe();
  ipfservice.cidBehavior.subscribe((x) => {}).unsubscribe();
  boxservice.status.subscribe((x) => {}).unsubscribe();
  gitservice.canExport.subscribe((x) => {}).unsubscribe();

  const getUrlLink = () => {
    if (cid !== "" && cid !== undefined && cid) {
      //Utils.log(ipfservice.cid);
      return (
        <>
          <div id='ipfshashresult' data-hash={ipfservice.cid} className='overflow-hidden w-100'>IPFS Hash: {ipfservice.cid}</div>
          <br></br>
          <CopyToClipboard
            text={ipfservice.cid}
            onCopy={() => {
              toast.success("Copied to clipboard.");
            }}
          >
            <button className="btn btn-primary mb-2">Copy to clipboard</button>
          </CopyToClipboard>
          <br></br>
          <a className="btn btn-primary mb-2" target="_blank" href={getUrl()} id="CID">
            View files
          </a>
          <br></br>
          <a className="btn btn-primary" target="_blank" href={getVscodeUrl()} hidden id="VSCODE">
            Clone in VSCode
          </a>
        </>
      );
    } else {
      return <></>;
    }
  };

  useEffect(() => {
    //Utils.log("export view");
    //ipfservice.setipfsHost();
  }, []);

  const addFilesToIpfs = async () => {
    try {
      await ipfservice.addToIpfs();
      await localipfsstorage.addToStorage(
        await localipfsstorage.createBoxObject()
      );
    } catch (e) {}
  };

  const addFilesToPinata = async () =>{
    try {
      await ipfservice.addFilesToPinata();
    } catch (e) {}
  }

  const getUrl = () => {
    return `${ipfservice.ipfsconfig.ipfsurl}${cid}`;
  };

  const getVscodeUrl = () =>{
    return `vscode://${process.env.REACT_APP_REMIX_EXTENSION}/pull?cid=${cid}`;
  }

  return (
    <>

      {canExport ? (
        <></>
      ) : (
        <div className="alert alert-danger w-md-25 w-100 mt-2" role="alert">
          Commit some files first, then you can export.
        </div>
      )}
       <h4>Export to Pinata Cloud</h4>
       {PinataStatus ? (
        <></>
      ) : (
        <div className="alert alert-warning w-md-25 w-100 mt-2" role="alert">
          Your Pinata API key is incorrect or missing. Unable to connect. Check your
          settings.
        </div>
      )}
      <button
        disabled={(PinataStatus ? false : true) || (canExport ? false : true)}
        className="btn w-md-25 w-100 btn-primary"
        id="main-btn"
        onClick={async () => await addFilesToPinata()}
      >
        Export to Pinata
      </button>
      <hr></hr>
      <h4>Export to Local storage & IPFS</h4>
      {IPFSStatus ? (
        <></>
      ) : (
        <div className="alert alert-warning w-md-25 w-100 mt-2" role="alert">
          Your IPFS settings are incorrect. Unable to connect. Check your
          settings.
        </div>
      )}
      <button
        disabled={(IPFSStatus ? false : true) || (canExport ? false : true)}
        className="btn w-md-25 w-100 btn-primary"
        id="addtocustomipfs"
        onClick={async () => await addFilesToIpfs()}
      >
        Export to custom IPFS & store in local storage
      </button>

      <br />
      <div id="ipfsAlert" role="alert"></div>
      <br />
      {getUrlLink()}
      <hr />
    </>
  );
};

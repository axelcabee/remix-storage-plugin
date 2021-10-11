import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { useBehaviorSubject } from "../usesubscribe/index";
import { ipfservice, useLocalStorage } from "../../App";

interface IPFSConfigProps {}

export const IPFSConfig: React.FC<IPFSConfigProps> = ({}) => {
  const [host, sethost] = useLocalStorage(
    "IPFS_HOST",
    ipfservice.ipfsconfig.host
  );
  const [port, setport] = useLocalStorage(
    "IPFS_PORT",
    ipfservice.ipfsconfig.port.toString()
  );
  const [protocol, setprotocol] = useLocalStorage(
    "IPFS_PROTOCOL",
    ipfservice.ipfsconfig.protocol
  );
  const [url, setUrl] = useLocalStorage(
    "IPFS_URL",
    ipfservice.ipfsconfig.ipfsurl || ""
  );
  const IPFSStatus = useBehaviorSubject(ipfservice.connectionStatus);
  ipfservice.connectionStatus.subscribe((x) => {}).unsubscribe();
  const setHostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    sethost(e.currentTarget.value);
    ipfservice.ipfsconfig.host = e.currentTarget.value;
  };
  const setPortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setport(e.currentTarget.value);
    ipfservice.ipfsconfig.port = parseInt(e.currentTarget.value);
  };
  const setProtocolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setprotocol(e.currentTarget.value);
    ipfservice.ipfsconfig.protocol = e.currentTarget.value;
  };
  const setUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.currentTarget.value);
    ipfservice.ipfsconfig.ipfsurl = e.currentTarget.value;
  };

  useEffect(() => {
    const check  = async () => { 
    //  client.onload(() => {
        ipfservice.ipfsconfig.host = host;
        ipfservice.ipfsconfig.ipfsurl = url;
        ipfservice.ipfsconfig.protocol = protocol;
        ipfservice.ipfsconfig.port = port;
    //    checkconfig();
    //  });
    }
    check();
  }, []);

  const checkconfig = async () => {
    toast.dismiss();
    await ipfservice.setipfsHost();
  };

  return (
    <>
      <h5>Custom IPFS gateway</h5>
      <label>HOST</label>

      <input
        onChange={setHostChange}
        className="form-control w-100"
        type="text"
        id="hostname"
        value={host}
      />
      <label>PORT</label>
      <input
        onChange={setPortChange}
        className="form-control w-100"
        type="number"
        id="port"
        value={port}
      />
      <label>PROTOCOL</label>
      <input
        onChange={setProtocolChange}
        className="form-control w-100"
        type="text"
        id="protocol"
        value={protocol}
      />
      <label>URL</label>
      <input
        onChange={setUrlChange}
        className="form-control w-100"
        type="text"
        id="url"
        value={url}
      />
      <button id='btncheckipfs' className="btn btn-primary mt-5" onClick={checkconfig}>
        Check connection
      </button>
      {IPFSStatus ? (
        <div id='ipfschecksuccess' className="alert alert-success w-md-25 w-100 mt-2" role="alert">
          Your IPFS settings are working correctly.
        </div>
      ) : (
        <div id='ipfscheckerror' className="alert alert-warning w-md-25 w-100 mt-2" role="alert">
          Your IPFS settings are incorrect. Unable to connect. Check your
          settings.
        </div>
      )}
    </>
  );
};

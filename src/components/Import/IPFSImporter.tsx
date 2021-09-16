import React, { createRef, useState } from "react";
import { useBehaviorSubject } from "../usesubscribe/index";
import { ipfservice, Utils } from "../../App";
import ConfirmDelete from "../ConfirmDelete";

interface ipfsimporterProps {}

export const IPFSImporter: React.FC<ipfsimporterProps> = ({}) => {
  const [cid, setCID] = useState({ value: "" });
  const IPFSStatus = useBehaviorSubject(ipfservice.connectionStatus)
  let ModalRef = createRef<ConfirmDelete>();
  ipfservice.connectionStatus.subscribe((x)=>{}).unsubscribe(); 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCID({ value: e.currentTarget.value });
  };


  const importFromCID = async (cid: string | undefined, name:string = "") => {
    try {
      await ModalRef.current?.show();
      await ipfservice.importFromCID(cid,name,false)
      //Utils.log("yes");
    } catch (e) {
      //Utils.log("no");
    }
  };

  return (
    <>
      <ConfirmDelete title={"Importing"} text={"This will create a new workspace! Continue?"} ref={ModalRef}></ConfirmDelete>
      <div className="form-group">
        <h4>Import from IPFS hash</h4>
        <label>IPFS HASH</label>
        <input onChange={handleChange} className="form-control" type="text" id="ipfs" />
      </div>
      <div id="ipfsimportalert"></div>
      <button disabled={(IPFSStatus?false:true)||(cid.value===""?true:false)} onClick={async()=> await importFromCID(cid.value, cid.value)} className="btn w-md-25 w-100 btn-primary" id="clone-btn">
        import from IPFS
      </button>
      {IPFSStatus?<></>:<div className="alert alert-warning w-md-25 w-100 mt-2" role="alert">
        Your IPFS settings are incorrect. Unable to connect. Check your settings.
      </div>}
      <hr />
    </>
  );
};

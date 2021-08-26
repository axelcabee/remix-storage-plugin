import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { createRef, useEffect } from "react";
import { Card } from "react-bootstrap";
import { useBehaviorSubject } from "../usesubscribe/index";
import { ipfservice, localipfsstorage, Utils } from "../../App";
import ConfirmDelete from "../ConfirmDelete";
import CopyToClipboard from "react-copy-to-clipboard";
import { toast } from "react-toastify";

interface LocalIPFSViewProps {}

export const LocalIPFSView: React.FC<LocalIPFSViewProps> = ({}) => {
  const boxobjects = useBehaviorSubject(localipfsstorage.boxObjects);
  let ModalRef = createRef<ConfirmDelete>();
  let EraseModalRef = createRef<ConfirmDelete>();
  useEffect(() => {
    //localipfsstorage.init();
  }, []);

  localipfsstorage.boxObjects
    .subscribe((x) => {
      //Utils.log("box objects", x);
    })
    .unsubscribe();

  const getUrlLink = (cid: string | undefined) => {
    if (cid !== "" && cid !== undefined) {
      return (
        <a target="_blank" href={getUrl(cid)} id="CID">
          {getUrl(cid)}
        </a>
      );
    } else {
      return <></>;
    }
  };

  const getViewButton = (cid: string | undefined) => {
    if (cid !== "" && cid !== undefined) {
      return (
        <a className="btn btn-primary btn-sm mr-2" target="_blank" href={getUrl(cid)} id="CID">
          View files
        </a>
      );
    } else {
      return <></>;
    }
  };

  const getUrl = (cid: string) => {
    return `${ipfservice.ipfsconfig.ipfsurl}${cid}`;
  };

  const importFromCID = async (cid: string | undefined, name:string = "") => {
    try {
      await ModalRef.current?.show();
      await ipfservice.importFromCID(cid,name, true)
      //Utils.log("yes");
    } catch (e) {
      //Utils.log("no");
    }
  };

  const deleteItem = async(o:any) =>{
    try {
      await EraseModalRef.current?.show();
      await localipfsstorage.deleteFromStorage(o?.cid)
      //Utils.log("yes");
    } catch (e) {
      //Utils.log("no");
    }
  }

  return (
    <>
      <h4>Import from Local Storage</h4>
      <ConfirmDelete title={"Importing"} text={"This will create a new workspace! Continue?"} ref={ModalRef}></ConfirmDelete>
      <ConfirmDelete title={"Deleting"} text={"Are you sure you want to erase this item?"} ref={EraseModalRef}></ConfirmDelete>
      <div className="container-fluid">
        {(boxobjects || []).map((o, index) => {
          return (
            <div key={index} className="row p-1">
              <Card className="w-75">
                <Card.Body>
                  <h5>{o.key}</h5>
                  <div className="row">
                    <div className="col">IPFS</div>
                    <div className="col">{o.cid}</div>
                  </div>
                  <div className="row">
                    <div className="col">DATE EXPORTED</div>
                    <div className="col">{o.datestored}</div>
                  </div>
                  <div className="row">
                    <div className="col">DATE OF LAST COMMIT</div>
                    <div className="col">{o.datecommit}</div>
                  </div>
                  <div className="row">
                    <div className="col">MESSAGE</div>
                    <div className="col">{o.message}</div>
                  </div>
                </Card.Body>
              </Card>
              <div className="col">
                <button
                  onClick={async () => await importFromCID(o.cid, o.key)}
                  className="btn btn-primary btn-sm mr-2 import3b-btn"
                >
                  import
                </button>
               {getViewButton(o.cid)}
                <button
                  onClick={async () =>
                    await deleteItem(o)
                  }
                  className="btn btn-danger btn-sm delete3b-btn"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
                <br></br>
                  <CopyToClipboard
            text={o.cid || ""}
            onCopy={() => {
              toast.success("Copied to clipboard.");
            }}
          >
            <button className="mt-2 btn btn-primary mb-2 btn-sm">Copy hash to clipboard</button>
          </CopyToClipboard>
              </div>
            </div>
          );
        })}
        {boxobjects?.length===0?<>Nothing has been stored here yet.</>:<></>}
      </div>
    </>
  );
};

import React, { createRef, useState } from "react";
import { Alert } from "react-bootstrap";
import { useBehaviorSubject } from "../../usesubscribe/index";
import { gitservice, Utils } from "../../../App";
import ConfirmDelete from "../../ConfirmDelete";

interface gitBranchProps {}

export const GitBranch: React.FC<gitBranchProps> = ({}) => {
  const branches = useBehaviorSubject(gitservice.branches);
  const branch = useBehaviorSubject(gitservice.branch);
  const [newBranch, setNewBranch] = useState({ value: "" });
  let ModalRef = createRef<ConfirmDelete>();
  let show: boolean = false;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewBranch({ value: e.currentTarget.value });
  };

  gitservice.branches
    .subscribe((x) => {
      //Utils.log(branches);
      if (branches) {
        show = branches.length > 0;
      }
    })
    .unsubscribe();

  gitservice.branch
    .subscribe((x) => {
      //Utils.log(branch);
    })
    .unsubscribe();
  const checkout = async (oid: string, remote: string | 'origin') => {
    try {
      await ModalRef.current?.show();
      let cmd = {ref:oid, remote:remote}
      gitservice.checkout(cmd);
      //Utils.log("yes");
    } catch (e) {
      //Utils.log("no");
    }
  };
  return (
    <>
      <hr></hr>
      <div className={show ? "" : "d-none"}>
        <h4>Branches</h4>
        <ConfirmDelete
          title={"Checking out"}
          text={
            <div>
              Checking out a branch will delete the files in Remix.<br></br>
              <strong>Check if you have uncommited work.</strong>
              <br></br>Continue?
            </div>
          }
          ref={ModalRef}
        ></ConfirmDelete>
        <Alert className="w-md-50 w-100 text-break" variant="success">
          {branch}
        </Alert>
        {branches?.map((branch, index) => {
          return (
            <div key={index} className="row p-1">
              <div className="col-md-2 col-6">{branch.name} on {branch.remote || 'local'}</div>
              <div className="col">
                <span className="float-right">
                  <div
                    onClick={async () => await checkout(branch.name, branch.remote)}
                    className="btn btn-primary btn-sm checkout-btn"
                  >
                    checkout
                  </div>
                </span>
              </div>
            </div>
          );
        })}
        <hr />
        <h4>Create branch</h4>
        <div className="form-group">
          <label>Branch name</label>
          <input
            onChange={handleChange}
            className="form-control w-md-25 w-100"
            type="text"
            id="newbranchname"
          />
        </div>
        <button
          onClick={async () => gitservice.createBranch(newBranch.value)}
          className="btn w-md-25 w-100 btn-primary"
          id="createbranch-btn"
        >
          git branch
        </button>
      </div>
    </>
  );
};

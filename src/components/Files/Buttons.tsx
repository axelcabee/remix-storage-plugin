import React from "react";
import { client, fileservice, gitservice, Utils } from "../../App";
import "./FileExplorer.css";
import { fileExplorerNode } from "./types";
interface FileButtonsProps {
  file: fileExplorerNode;
  setTab: (key: string) => void;
}

export const FileButtons: React.FC<FileButtonsProps> = ({
  file,
  setTab,
}: FileButtonsProps) => {
  const diffFile = (file: fileExplorerNode) => {
    gitservice.diffFiles('');
    ///setTab("diff")
  };

  const gitaddButton = (file: fileExplorerNode) => {
    let status = fileservice.getFileStatusForFile(file.fullname || "");
    ////Utils.log("file status", status, status?.indexOf("with unstaged changes"));
    if (
      (status?.indexOf("deleted") === -1 &&
        status?.indexOf("unmodified") === -1 &&
        status?.indexOf("staged") === -1) ||
      status?.indexOf("with unstaged changes") !== -1
    ) {
      return (
        <div
          className={"badge badge-primary addgit"}
          onClick={async () => await gitservice.addToGit(file.fullname)}
        >
          git add
        </div>
      );
    } else {
      return <div className={"badge badge-secondary addgit"}>git add</div>;
    }
  };

  const giteditButton = (file: fileExplorerNode) => {
    let status = fileservice.getFileStatusForFile(file.fullname || "");
    if (status?.indexOf("deleted") === -1) {
      return (
        <div
          className={"badge badge-primary addgit"}
          onClick={async () => await fileservice.viewFile(file.fullname)}
        >
          edit
        </div>
      );
    } else {
      return <div className={"badge badge-secondary addgit"}>edit</div>;
    }
  };

  const gitrmbutton = (file: fileExplorerNode) => {
    let status = fileservice.getFileStatusForFile(file.fullname || "");
    if (status?.indexOf("deleted") === -1) {
      return <div className={"badge badge-secondary addgit"}>git rm</div>;
    } else {
      if (status?.indexOf("staged") === -1) {
        return (
          <div
            className={"badge badge-primary addgit"}
            onClick={async () => await gitservice.gitrm(file.fullname)}
          >
            git rm
          </div>
        );
      } else {
        return <div className={"badge badge-secondary addgit"}>git rm</div>;
      }
    }
  };

  const checkoutbutton = (file: fileExplorerNode) => {
    let status = fileservice.getFileStatusForFile(file.fullname || "");
    if (
      status?.indexOf("modified") === -1 &&
      (status?.indexOf("deleted") === -1 ||
        status?.indexOf("staged") ||
        status?.indexOf("unstaged"))
    ) {
      return <div className={"badge badge-secondary addgit"}>git checkout</div>;
    } else {
      return (
        <div
          className={"badge badge-primary addgit"}
          onClick={async () => await gitservice.checkoutfile(file.fullname)}
        >
          git checkout
        </div>
      );
    }
  };

  if (file.type === "file") {
    return (
      <span className="status float-right ml-3">
        {gitaddButton(file)}
        {gitrmbutton(file)}
        {checkoutbutton(file)}
      </span>
    );
  } else {
    return <></>;
  }
};

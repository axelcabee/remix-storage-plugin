import React, { useEffect } from "react";
import { useBehaviorSubject } from "../../usesubscribe/index";
import { client, fileservice, Utils } from "../../../App";

interface GitStatusProps { }

export const GitStatus: React.FC<GitStatusProps> = ({ }) => {
  const files = useBehaviorSubject(fileservice.filetreecontent);
  let staged = 0;
  let untracked = 0;
  let deleted = 0;
  let modified = 0;
  let show = false
  fileservice.filetreecontent
    .subscribe((x) => {
      //Utils.log("GIT STATUS", files);
      staged = fileservice.getFilesCountByStatus("staged");
      untracked = fileservice.getFilesCountByStatus("untracked");
      deleted = fileservice.getFilesCountByStatus("deleted");
      modified = fileservice.getFilesCountByStatus("modified");
      show = (deleted > 0 || staged > 0 || untracked > 0 || modified > 0)
      let total = deleted + staged + untracked + modified
      

      client.onload(() => {
        client.emit('statusChanged', {
          key: total===0? 'none':total,
          type: total===0? '':'success',
          title: 'Git changes'
        })
      })

    })
    .unsubscribe();

  useEffect(() => { }, []);

  return (
    <>
      {show ?
        <>
          <hr></hr>
          <div>Git status</div>
          <div className="alert alert-success">
            {staged > 0 ? <div>{staged} staged</div> : <></>}
            {modified > 0 ? <div>{modified} modified</div> : <></>}
            {untracked > 0 ? <div>{untracked} untracked</div> : <></>}
            {deleted > 0 ? <div>{deleted} deleted</div> : <></>}
          </div></>
        : <></>}
    </>
  );
};

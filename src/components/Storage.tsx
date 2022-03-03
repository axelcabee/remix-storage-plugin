import React, { useEffect, useRef, useState } from "react";
import { ProgressBar } from "react-bootstrap";
import { gitservice } from "../App";
import './Storage.css'

export const StorageProgress = (props: any) => {
    const { storageUsed, repoName, update } = props;
    const [percentage, setPercentage] = useState<number>(0);
    const [storage, setStorage] = useState<string>('');
    let updateTimer = useRef<any>(null);
    const storageVariant = () => {
        const percentageUsed = parseFloat(storageUsed.usage || '0') / storageUsed.quota * 100
        let variant = 'success'
        if (percentageUsed > 50) variant = 'warning'
        if (percentageUsed > 80) variant = 'danger'
        // setPercentage(percentageUsed)
        return variant
    }

    useEffect((): any => {
        if(update && !updateTimer.current) {
            updateTimer.current = setInterval(async () => {
                await gitservice.getStorageUsed();
            }, 1000)
        }else{
            clearInterval(updateTimer.current)
        }
    }
    ,[update])


    useEffect(() => {
        return () => {
            clearInterval(updateTimer.current)
        }
    }, [])

    useEffect(() => {
        const percentageUsed = parseFloat(storageUsed.usage || '0') / (storageUsed.quota*2)
        setPercentage(percentageUsed)
        setStorage(formatBytes(storageUsed.usage, 2))
    }, [storageUsed])


    function formatBytes(bytes: number, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
    
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
        const i = Math.floor(Math.log(bytes) / Math.log(k));
    
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    const storageUseText = () => {
        return <><span className={`text-${storageVariant()}`}>{storage} {Math.round(percentage*100)}% of storage used</span></>
    }

    return (
        <>
        {storageUsed? update? <>{storageUseText()}</>:
        <><div className="nav navbar bg-light p-1 mb-1"><div><div className={`float-left pr-1 m-0`}>dGit</div> | repo: {repoName}<br></br></div>{storageUseText()}</div></>: null}
        </>
    )
}
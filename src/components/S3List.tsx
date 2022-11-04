import React, { useState, useEffect } from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Typography,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import AWS from "aws-sdk";
import "./s3.scss";

AWS.config.update({
    accessKeyId: process.env.REACT_APP_ACCESS_ID || "",
    secretAccessKey: process.env.REACT_APP_ACCESS_KEY || "",
    region: process.env.REACT_APP_REGION || "",
});
const s3 = new AWS.S3();

const params = {
    Bucket: process.env.REACT_APP_DESTINATION_BUCKET || "",
    Delimiter: ''
};
interface Is3List {
    name: string
    ContentType: string
    LastModified: string;
    size: string;
}
const BucketList = () => {
    const [listFiles, setListFiles] = useState([]);
    const [bucketName, setBucketName] = useState("");
    const [expanded, setExpanded] = useState("");
    const [bucketList, setBucketList] = useState([{ name: "", ContentType: "", LastModified: "", size: "" }]);

    function formatBytes(bytes:number, decimals = 2) {
        if (!+bytes) return '0 Bytes'
    
        const k = 1024
        const dm = decimals < 0 ? 0 : decimals
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    
        const i = Math.floor(Math.log(bytes) / Math.log(k))
    
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
    }
    useEffect(() => {
        s3.listObjectsV2(params, (err, data: any) => {
            if (err) {
                console.log(err, err.stack);
            } else {
                setListFiles(data.Contents);
                console.log(data.Contents)
                setBucketName(data.Name)
                let dummy: any = [];
                data.Contents.map((e: any) => {
                    let getParm = {
                        Bucket: data.Name,
                        Key: e.Key
                    }
                    s3.getObject(getParm, function (err, file: any) {
                        if (err) {
                            console.log('errrr', err)
                            return err;
                        }
                        

                            dummy.push({ name: e.Key, ContentType: file.ContentType, LastModified: file.LastModified, size: formatBytes(file.ContentLength) });
                            setBucketList([...dummy || undefined]);
                        
                    });
                });
            }
        });
    }, []);

    useEffect(() => {
        console.log('bucketList', bucketList)
    }, [bucketList]);

    function handleChange(e: any) {
        console.log(e)
    }

    return (
        <div className="card">
            <div style={{}}>
                <div className="headings3">TransCoded Files</div>
            </div>
            <div>
                {bucketList.length >1 && bucketList.map((data: any,index) => (
                    <Accordion key={index}>
                        <AccordionSummary
                            expandIcon={<ExpandMore />}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                        >
                            <Typography>{data.name}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography>
                            ContentType : {data.ContentType} <br/><br/>
                            Size : {data.size}
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </div>
        </div>
    );
};

export default BucketList;

import React, { useState } from "react";
import { Buffer } from "buffer";
import CryptoJS from "crypto-js";
import Button from "@material-ui/core/Button";
import { useNavigate } from "react-router-dom";

const S3_BUCKET = process.env.REACT_APP_SOURCE_BUCKET || "";
const REGION = process.env.REACT_APP_REGION || "";
const ACCESS_ID = process.env.REACT_APP_ACCESS_ID || "";
const SECRET_ACCESS_KEY = process.env.REACT_APP_ACCESS_KEY || "";

const config = {
  bucketName: S3_BUCKET,
  region: REGION,
  accessKeyId: ACCESS_ID,
  secretAccessKey: SECRET_ACCESS_KEY,
};

const S3Upload = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const dateISOString = new Date(+new Date() + 864e5).toISOString();
  const xAmzDate = dateISOString
    .split("-")
    .join("")
    .split(":")
    .join("")
    .split(".")
    .join("");
  const dateYMD = dateISOString.split("T")[0].split("-").join("");
  console.log("handleFileInput", selectedFile);
  const handleFileInput = (e: any) => {
    setSelectedFile(e.target.files[0]);
  };
  function getPolicy(config: any) {
    const policy = () => {
      return {
        expiration: dateISOString,
        conditions: [
          { bucket: config.bucketName },
          [
            "starts-with",
            "$key",
            `${config.dirName ? config.dirName + "/" : ""}`,
          ],
          { acl: "public-read" },
          ["starts-with", "$Content-Type", ""],
          { "x-amz-meta-uuid": "14365123651274" },
          { "x-amz-server-side-encryption": "AES256" },
          ["starts-with", "$x-amz-meta-tag", ""],
          {
            "x-amz-credential": `${config.accessKeyId}/${dateYMD}/${config.region}/s3/aws4_request`,
          },
          { "x-amz-algorithm": "AWS4-HMAC-SHA256" },
          { "x-amz-date": xAmzDate },
        ],
      };
    };
    //Returns a base64 policy;
    return new Buffer(JSON.stringify(policy()))
      .toString("base64")
      .replace(/\n|\r/, "");
  }

  function getSignature(config: any, date: string, policyBase64: any) {
    const getSignatureKey = (
      key: String,
      dateStamp: string,
      regionName: string
    ) => {
      const kDate = CryptoJS.HmacSHA256(dateStamp, "AWS4" + key);
      const kRegion = CryptoJS.HmacSHA256(regionName, kDate);
      const kService = CryptoJS.HmacSHA256("s3", kRegion);
      const kSigning = CryptoJS.HmacSHA256("aws4_request", kService);
      return kSigning;
    };
    const signature = (policyEncoded: string) => {
      return CryptoJS.HmacSHA256(
        policyEncoded,
        getSignatureKey(config.secretAccessKey, date.toString(), config.region)
      ).toString(CryptoJS.enc.Hex);
    };
    return signature(policyBase64);
  }

  async function uploadFile(file: any, config: any) {
    const fd = new FormData();
    const key = `${config.dirName ? config.dirName + "/" : ""}${file.name}`;
    const url = `https://${config.bucketName}.s3.amazonaws.com/`;
    fd.append("key", key);
    fd.append("acl", "public-read");
    fd.append("Content-Type", file.type);
    fd.append("x-amz-meta-uuid", "14365123651274");
    fd.append("x-amz-server-side-encryption", "AES256");
    fd.append(
      "X-Amz-Credential",
      `${config.accessKeyId}/${dateYMD}/${config.region}/s3/aws4_request`
    );
    fd.append("X-Amz-Algorithm", "AWS4-HMAC-SHA256");
    fd.append("X-Amz-Date", xAmzDate);
    fd.append("x-amz-meta-tag", "");
    fd.append("Policy", getPolicy(config));
    fd.append(
      "X-Amz-Signature",
      getSignature(config, dateYMD, getPolicy(config))
    );
    fd.append("file", file);

    const params: any = {
      method: "post",
      headers: {
        fd,
      },
      body: fd,
    };

    const data = await fetch(url, params);
    if (!data.ok) return Promise.reject(data);
    return Promise.resolve({
      bucket: config.bucketName,
      key: `${config.dirName ? config.dirName + "/" : ""}${file.name}`,
      location: `${url}${config.dirName ? config.dirName + "/" : ""}${
        file.name
      }`,
      result: data,
    });
  }

  const handleUpload = async (file: any) => {
    await uploadFile(file, config)
      .then((data) => console.log(data))
      .catch((err) => console.error(err));
  };

  return (
    <div className="main">
      <h1>React S3 File Upload</h1>
      <div className="uploadWrapper">
        <Button className="upload" component="label">
          Choose your Video File
          <input type="file" hidden onChange={handleFileInput} />
        </Button>
        <button
          className="uploadBtn"
          onClick={() => handleUpload(selectedFile)}
        >
          Upload to S3
        </button>
      </div>
      {selectedFile && (
        <p style={{ marginTop: "4%" }}>
          Selected File -{" "}
          {<span className="fileName">{selectedFile["name"]}</span>}
        </p>
      )}
      <Button onClick={() => navigate("/")} color="primary" className="mt-5">
        Go Back
      </Button>
    </div>
  );
};

export default S3Upload;

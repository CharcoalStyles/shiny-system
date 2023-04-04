import axios from "axios";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    disabled: loading,
  });

  useEffect(() => {
    console.log(acceptedFiles);
  }, [acceptedFiles]);

  return (
    <main>
      <div className="max-w-md mx-auto my-10 bg-white p-5 rounded-md shadow-sm">
        <section className="container">
          <div
            {...getRootProps({ className: "dropzone" })}
            className="bg-black p-5 rounded-md shadow-sm"
          >
            <input {...getInputProps()} />
            {loading ? <p>Uploading...</p> : <p>Drag 'n' drop some files here, or click to select files</p>}
          </div>
          <aside className="text-black">
            <h4>Files</h4>
            {acceptedFiles.length > 0 ? (
              <ul>
                {acceptedFiles.map((file) => (
                  <li key={file.path}>
                    {file.path} - {file.size} bytes
                  </li>
                ))}
              </ul>
            ) : (
              <p>No files selected</p>
            )}
          </aside>
        </section>
        <button
          onClick={() => {
            setLoading(true);
            const uploadPromises = acceptedFiles.map((file) => {
              return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                  const base64Image = reader.result?.toString().split(",")[1];
                  axios
                    .post("/api/upload", { image: base64Image, lastModified: file.lastModified })
                    .then((res) => {
                      console.log(res.data);
                      resolve(res.data);
                      setLoading(false);
                    })
                    .catch((err) => {
                      console.error(err);
                      reject(err);
                      setLoading(false);
                    });
                };
              });
            });
          }}
          className="bg-blue-500 text-white p-2 rounded-md mt-5 hover:bg-blue-600"
        >
          Upload
        </button>
      </div>
      Î
    </main>
  );
}

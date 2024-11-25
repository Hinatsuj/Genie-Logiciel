import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Typography, TextField, Box, Grid, IconButton } from "@mui/material";
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

function FileClient() {
  const [serverAddress, setServerAddress] = useState("localhost");
  const [port, setPort] = useState(12345);
  const [selectedFile, setSelectedFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [logs, setLogs] = useState([]);

  // Charger la liste des fichiers envoyés depuis le serveur au démarrage
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get(`http://${serverAddress}:${port}/files`);
        setFiles(response.data); // Récupère la liste des fichiers
      } catch (error) {
        setLogs((prevLogs) => [...prevLogs, "Erreur de récupération des fichiers."]);
      }
    };

    fetchFiles();
  }, [serverAddress, port]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setLogs((prevLogs) => [
      ...prevLogs,
      `Fichier sélectionné : ${event.target.files[0].name}`,
    ]);
  };

  const sendFile = async () => {
    if (!selectedFile) {
      setLogs((prevLogs) => [...prevLogs, "Aucun fichier sélectionné."]);
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setLogs((prevLogs) => [...prevLogs, "Connexion au serveur..."]);
      const response = await axios.post(
        `http://${serverAddress}:${port}/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // Mettre à jour la liste des fichiers après l'envoi
      setFiles((prevFiles) => [...prevFiles, response.data.filename]);

      setLogs((prevLogs) => [...prevLogs, "Fichier envoyé avec succès."]);
    } catch (error) {
      setLogs((prevLogs) => [
        ...prevLogs,
        `Erreur : ${error.message}`,
      ]);
    }
  };

  const downloadFile = (filename) => {
    setLogs((prevLogs) => [...prevLogs, `Téléchargement de ${filename} en cours...`]);
    // Le fichier sera téléchargé depuis le serveur
    window.open(`http://${serverAddress}:${port}/files/${filename}`, "_blank");
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Client de Transfert de Fichiers
      </Typography>

      <div>
        <TextField
          label="Adresse du Serveur"
          value={serverAddress}
          onChange={(e) => setServerAddress(e.target.value)}
          sx={{ marginRight: "10px", marginBottom: "20px" }}
        />
        <TextField
          label="Port"
          type="number"
          value={port}
          onChange={(e) => setPort(e.target.value)}
          sx={{ marginRight: "10px", marginBottom: "20px" }}
        />
      </div>

      <div>
        <input type="file" onChange={handleFileChange} />
        <Button variant="contained" onClick={sendFile} sx={{ marginLeft: "10px" }}>
          Envoyer
        </Button>
      </div>

      <Box sx={{ marginTop: "30px" }}>
        <Typography variant="h6">Fichiers Envoyés :</Typography>
        <Grid container spacing={2}>
          {files.map((file, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  justifyContent: "space-between",
                  backgroundColor: "#f9f9f9",
                }}
              >
                {/* Icône de fichier */}
                <InsertDriveFileIcon sx={{ marginRight: "10px" }} />
                <Typography variant="body1" sx={{ flexGrow: 1 }}>
                  {file}
                </Typography>
                {/* Bouton de téléchargement */}
                <IconButton onClick={() => downloadFile(file)} sx={{ color: "blue" }}>
                  Télécharger
                </IconButton>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ marginTop: "30px" }}>
        <Typography variant="h6">Logs :</Typography>
        <Box
          sx={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "10px",
            backgroundColor: "#f9f9f9",
            minHeight: "150px",
            maxHeight: "300px",
            overflowY: "auto",
            fontFamily: "monospace",
          }}
        >
          {logs.map((log, index) => (
            <Typography key={index} variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
              {log}
            </Typography>
          ))}
        </Box>
      </Box>
    </div>
  );
}

export default FileClient;

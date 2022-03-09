import React, { useState, useEffect } from "react";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core//TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core//TableRow';
import Paper from '@material-ui/core//Paper';
import Button from "@material-ui/core/Button";
import PDFIcon from '@material-ui/icons/PictureAsPdfOutlined';
import ExcelIcon from '@material-ui/icons/ExplicitOutlined';
import BackIcon from '@material-ui/icons/ArrowBack';

const btnStyle = {
    background: "none",
    border: "none",
    color: "#069",
    padding: '0px'
}

export default function QuoteReports({ setRenderCompo }) {
    const [quotes, setQuotes] = useState([]);

    const downloadFiles = (fileName) => {
        fetch(`${process.env.REACT_APP_API}/getQuoteFile/${fileName}`)
            .then(res => res.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(new Blob([blob]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
            })
    }

    const formatDate = (date) => {
        return new Date(+date)
            .toLocaleString("en-US", { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API}/quotes/`)
            .then((r) => r.json())
            .then((res) => {
                setQuotes([...res])
            })
            .catch((e) => console.log("Error ", e.message));
    }, [])

    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell align="left">
                            <Button title="Back" style={btnStyle} onClick={() => setRenderCompo('default')}>
                                <BackIcon tilte='Back' style={{ transform: 'scale(1.7)' }} />
                            </Button>
                        </TableCell>
                        <TableCell align="left"><b>Quote</b> </TableCell>
                        <TableCell align="left"><b>Generated Time</b></TableCell>
                        <TableCell align="left"><b>Excel</b></TableCell>
                        <TableCell align="left"><b>Pdf</b></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {quotes.map((row, i) => (
                        <TableRow key={row.file_name}>
                            <TableCell align="left">{i + 1 + '.'}</TableCell>
                            <TableCell>
                                {row.file_name}
                            </TableCell>
                            <TableCell align="left">
                                {formatDate(row.created_time)}
                            </TableCell>
                            <TableCell align="left">
                                <Button style={btnStyle} onClick={() => downloadFiles(row.file_name + '.xlsx')}>
                                    <ExcelIcon />Excel
                                </Button>
                            </TableCell>
                            <TableCell align="left">
                                <Button style={btnStyle} onClick={() => downloadFiles(row.file_name + '.pdf')}>
                                    <PDFIcon />Pdf
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

import { Dialog, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import React from "react";


export default function EditBrokerDialog() {
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };
    return (
        <>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Редактировать брокера</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Здесь вы можете редактировать информацию о брокере.
                    </DialogContentText>
                </DialogContent>
            </Dialog>
        </>
    );
}
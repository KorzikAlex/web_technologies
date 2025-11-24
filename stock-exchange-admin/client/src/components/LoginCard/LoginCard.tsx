import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import TextField from "@mui/material/TextField";

export default function LoginCard() {
    return (
        <div className="login-page">
            <Card className="login-card">
                <CardContent>
                    <List>
                        <ListItem>
                            <TextField id="outlined-basic" label="Outlined" variant="outlined" />
                        </ListItem>
                        <ListItem>
                            <TextField id="outlined-basic" label="Outlined" variant="outlined" />
                        </ListItem>
                        <ListItem>
                            <Button variant="outlined">Outlined</Button>
                        </ListItem>
                    </List>
                </CardContent>
            </Card>
        </div>
    );
}

import "../App.scss";
import React from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import { useNavigate } from "react-router-dom";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      margin: theme.spacing(1),
      width: "40%",
      height: "10%",
      fontSize: "x-large",
      fontWeight: "bolder",
    },
  })
);

const Home = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  return (
    <div className="home">
      <Button
        variant="contained"
        color="primary"
        size="large"
        className={classes.button}
        onClick={() => navigate("/upload")}
      >
        UPLOAD TO S3
      </Button>
      <br />
      <br />
      <Button
        variant="contained"
        color="secondary"
        size="large"
        className={classes.button}
        onClick={() => navigate("/bucketlist")}
      >
        VIEW UPLOADED DATA IN S3
      </Button>
    </div>
  );
};

export default Home;

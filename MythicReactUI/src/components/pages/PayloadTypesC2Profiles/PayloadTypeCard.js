import React, { useEffect } from 'react';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import {useTheme} from '@mui/material/styles';
import { MythicDialog } from '../../MythicComponents/MythicDialog';
import {PayloadTypeBuildDialog} from './PayloadTypeBuildDialog';
import {MythicConfirmDialog} from '../../MythicComponents/MythicConfirmDialog';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreFromTrashOutlinedIcon from '@mui/icons-material/RestoreFromTrashOutlined';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import IconButton from '@mui/material/IconButton';
import BuildIcon from '@mui/icons-material/Build';

import {gql, useMutation} from '@apollo/client';
import { snackActions } from '../../utilities/Snackbar';

const PREFIX = 'PayloadTypeCard';

const classes = {
  root: `${PREFIX}-root`
};

const StyledCard = styled(Card)((
  {
    theme
  }
) => ({
  [`&.${classes.root}`]: {
    width: "100%",
    display: "flex",
    marginBottom: "10px"
  }
}));

const toggleDeleteStatus = gql`
mutation togglePayloadTypeDeleteStatus($payloadtype_id: Int!, $deleted: Boolean!){
  update_payloadtype_by_pk(pk_columns: {id: $payloadtype_id}, _set: {deleted: $deleted}) {
    id
  }
}
`;

export function PayloadTypeCard(props) {

  const theme = useTheme();
  const [wrappedPayloads, setWrappedPayloads] = React.useState("");
  const [openBuildingDialog, setOpenBuildingDialog] = React.useState(false);
  const [supportedOS, setSupportedOS] = React.useState("");
  const [openDelete, setOpenDeleteDialog] = React.useState(false);
  const [updateDeleted] = useMutation(toggleDeleteStatus, {
    onCompleted: data => {
    },
    onError: error => {
      if(props.deleted){
        snackActions.error("Failed to restore payload type");
      } else {
        snackActions.error("Failed to mark payloadtype as deleted");
      }
      
    }
  })
  const onAcceptDelete = () => {
    updateDeleted({variables: {payloadtype_id: props.id, deleted: !props.deleted}})
    setOpenDeleteDialog(false);
  }
  useEffect( () => {
    if( props.wrap_these_payload_types.length > 0){
      const wrapped = props.wrap_these_payload_types.map( (cur) => {
        return cur.wrapped.name;
      });
      setWrappedPayloads(wrapped.join(", "));
    }
    else{
      setWrappedPayloads("");
    }
    setSupportedOS(props.supported_os.join(", "));
  }, [props.wrap_these_payload_types, props.supported_os]);
  return (
    <StyledCard className={classes.root} elevation={5} >
          <CardMedia
            className={classes.media}
            component="img"
            style={{width: "125px", padding: "10px", objectFit: "unset"}}
            src={"/static/" + props.name + ".svg"}
          />
        <div style={{maxWidth: "60%"}}>
          <Typography variant="h4" component="h1" style={{textAlign:"left", marginLeft: "10px"}}>{props.name}</Typography>
          <CardContent style={{textAlign:"left"}}>
              <Typography variant="body1" component="p">
                <b>Author:</b> {props.author}
              </Typography>
              <Typography variant="body1" component="p">
                <b>Supported Operating Systems:</b> {supportedOS}
              </Typography>
              {props.wrap_these_payload_types.length === 0 ? (null) : (
                <Typography variant="body1" component="p">
                  <b>Wrapped Payload Types:</b> {wrappedPayloads}
                </Typography>
              )}
              <Typography variant="body2" component="p">
                <b>Description:</b><br/>{props.note}
              </Typography>
              <Typography variant="body2" component="p" >
                <b>Container Status: </b>
              </Typography>
              <Typography variant="body2" component="p" color={props.container_running ? theme.palette.success.main : theme.palette.error.main} >
                <b>{props.container_running ? "Online" : "Offline"}</b>
              </Typography>
          </CardContent>
        </div>
        <div style={{display: "inline-flex",
            paddingRight: "10px", marginLeft: "auto",
            justifyContent: "space-evenly", alignItems: "stretch",
            flexDirection: "column", alignContent: "flex-end",
            backgroundColor: theme.palette.textBackgroundColor,
        }}>
            <IconButton
              color="secondary"
              href={props.wrapper ? "/docs/wrappers/" + props.name : "/docs/agents/" + props.name}
              target="_blank"
              size="large">
                <MenuBookIcon />
            </IconButton>
            <IconButton
              onClick={()=>{setOpenBuildingDialog(true);}}
              color="secondary"
              size="large">
                <BuildIcon />
            </IconButton>
            {props.deleted ? (
              <IconButton size="small" onClick={()=>{setOpenDeleteDialog(true);}} color="success" >
                  <RestoreFromTrashOutlinedIcon/>
              </IconButton>
            ) : (
              <IconButton size="small" onClick={()=>{setOpenDeleteDialog(true);}} color="error" >
                  <DeleteIcon/>
              </IconButton>
            )}
            
            {openDelete && 
              <MythicConfirmDialog onClose={() => {setOpenDeleteDialog(false);}} onSubmit={onAcceptDelete} 
                open={openDelete} 
                acceptText={props.deleted ? "Restore" : "Remove"} 
                acceptColor={props.deleted ? "success": "error"} />
            }
            {openBuildingDialog && 
              <MythicDialog fullWidth={true} maxWidth="lg" open={openBuildingDialog} 
                  onClose={()=>{setOpenBuildingDialog(false);}} 
                  innerDialog={<PayloadTypeBuildDialog {...props} onClose={()=>{setOpenBuildingDialog(false);}} payload_name={props.name} />}
                />}
              
          </div>
    </StyledCard>
  );
}

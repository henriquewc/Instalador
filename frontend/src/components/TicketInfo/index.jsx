import React, { useState, useEffect } from "react";

import { Avatar, CardHeader } from "@material-ui/core";

import { i18n } from "../../translate/i18n";
import { getInitials } from "../../helpers/getInitials";
import { generateColor } from "../../helpers/colorGenerator";
import {makeStyles} from "@material-ui/core/styles";


const useStyles = makeStyles(theme => ({
	ticketInfo: {
		cursor: "pointer",

		[theme.breakpoints.down("md")]: {
			paddingRight: 0,
			paddingLeft: 4,
			paddingBottom: 6,
			paddingTop: 6,
		},

	},
}));
const TicketInfo = ({ contact, ticket, onClick }) => {
	const { user } = ticket
	const [userName, setUserName] = useState('')
	const [contactName, setContactName] = useState('')


	useEffect(() => {
		if (contact) {
			setContactName(contact.name);
			if(document.body.offsetWidth < 600) {
				if (contact.name.length > 10) {
					const truncadName = contact.name.substring(0, 10) + '...';
					setContactName(truncadName);
				}
			}
		}

		if (user && contact) {
			setUserName(`${i18n.t("messagesList.header.assignedTo")} ${user.name}`);

			if(document.body.offsetWidth < 600) {
				setUserName(`${user.name}`);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	const classes = useStyles();

	return (
		<CardHeader
			onClick={onClick}
			style={{ cursor: "pointer" }}
			titleTypographyProps={{ noWrap: true }}
			className={classes.ticketInfo}
			subheaderTypographyProps={{ noWrap: true }}
			avatar={<Avatar style={{ backgroundColor: generateColor(contact?.number), color: "white", fontWeight: "bold" }} src={contact.profilePicUrl} alt="contact_image">{ getInitials(contact?.name) }</Avatar>}
			title={`${contactName} #${ticket.id}`}
			subheader={ticket.user && `${userName}
			${ticket.queue ? ' | Setor: ' + ticket.queue.name : ' | Setor: Nenhum'}`
			}
		/>
	);
};

export default TicketInfo;

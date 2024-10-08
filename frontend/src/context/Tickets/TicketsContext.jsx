import React, { useState, useEffect, createContext } from "react";
import { useHistory } from "react-router-dom";

const TicketsContext = createContext();

const TicketsContextProvider = ({ children }) => {
	const [currentTicket, setCurrentTicket] = useState({ id: null, code: null, uuid: null });
    const history = useHistory();

	useEffect(() => {
        if (currentTicket?.uuid) {
            history.push(`/tickets/${currentTicket.uuid}`);
        }
	// eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentTicket, history]);

	return (
		<TicketsContext.Provider
			value={{ currentTicket, setCurrentTicket }}
		>
			{children}
		</TicketsContext.Provider>
	);
};

export { TicketsContext, TicketsContextProvider };

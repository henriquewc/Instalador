import React, {
  useState,
  useEffect,
  useReducer,
  useCallback,
  useContext,
} from "react";
import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import DeleteForever from "@material-ui/icons/DeleteForever";
import EditIcon from "@material-ui/icons/Edit";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import TagModal from "../../components/TagModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { Chip } from "@material-ui/core";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useHistory } from "react-router-dom";
import { Can } from "../../components/Can";
import { Tooltip } from "@material-ui/core";
import { SocketContext } from '../../context/Socket/SocketContext';

const reducer = (state, action) => {
  if (action.type === "LOAD_TAGS") {
    const tags = action.payload;
    const newTags = [];
    tags.forEach((tag) => {
      const tagIndex = state.findIndex((s) => s.id === tag.id);
      if (tagIndex !== -1) {
        state[tagIndex] = tag;
      } else {
        newTags.push(tag);
      }
    });
    return [...state, ...newTags];
  }
  if (action.type === "UPDATE_TAGS") {
    const tag = action.payload;
    const tagIndex = state.findIndex((s) => s.id === tag.id);
    if (tagIndex !== -1) {
      state[tagIndex] = tag;
      return [...state];
    } else {
      return [tag, ...state];
    }
  }
  if (action.type === "DELETE_TAG") {
    const tagId = action.payload;
    const tagIndex = state.findIndex((s) => s.id === tagId);
    if (tagIndex !== -1) {
      state.splice(tagIndex, 1);
    }
    return [...state];
  }
  if (action.type === "RESET") {
    return [];
  }
};
const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
}));
const Tags = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [deletingTag, setDeletingTag] = useState(null);
  const [deletingAllTag, setDeletingAllTag] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [tags, dispatch] = useReducer(reducer, []);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const fetchTags = useCallback(async () => {
    try {
      const { data } = await api.get("/tags/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_TAGS", payload: data.tags });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  }, [searchParam, pageNumber]);

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);
  useEffect(async () => {
    setLoading(true);

    await fetchTags();

  }, [searchParam, pageNumber, fetchTags]);
  useEffect(() => {
    const socket = socketManager.GetSocket(user.companyId);

    const onUser = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_TAGS", payload: data.tags });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_USER", payload: +data.tagId });
      }
    }
    
    socket.on("user", onUser);

    return () => {
        socket.off("user", onUser);
    };
  }, [user, socketManager]);
  const handleOpenTagModal = () => {
    setSelectedTag(null);
    setTagModalOpen(true);
  };
  const handleCloseTagModal = () => {
    setSelectedTag(null);
    setTagModalOpen(false);
  };
  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };
  const handleEditTag = (tag) => {
    setSelectedTag(tag);
    setTagModalOpen(true);
  };
  const handleDeleteTag = async (tagId) => {
    try {
      await api.delete(`/tags/${tagId}`);
      toast.success(i18n.t("tags.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingTag(null);
    setSearchParam("");
    setPageNumber(1);
    dispatch({ type: "RESET" });
    setPageNumber(1);
    await fetchTags();
  };

  const handleDeleteAllTag = async () => {
    try {
      await api.delete("/tags");
      toast.success(i18n.t("tags.toasts.deletedAll"));
      history.go(0);
    } catch (err) {
      toastError(err);
    }
    setDeletingAllTag(null);
    setSearchParam("");
    setPageNumber();
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };
  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };
  return (
    <MainContainer>
      <ConfirmationModal
  title={
    deletingTag
      ? `${i18n.t("tags.confirmationModal.deleteTitle")} ${deletingTag.name}?`
      : deletingAllTag
      ? `${i18n.t("tags.confirmationModal.deleteAllTitle")}`
      : ""
  }
  open={confirmModalOpen}
  onClose={setConfirmModalOpen}
  onConfirm={() => {
    if (deletingTag) {
      handleDeleteTag(deletingTag.id);
    } else if (deletingAllTag) {
      handleDeleteAllTag();
    }
  }}
>
  {deletingAllTag
    ? i18n.t("tags.confirmationModal.deleteAllMessage")
    : i18n.t("tags.confirmationModal.deleteMessage")}
</ConfirmationModal>

      <TagModal
        open={tagModalOpen}
        onClose={handleCloseTagModal}
        reload={fetchTags}
        aria-labelledby="form-dialog-title"
        tagId={selectedTag && selectedTag.id}
      />
      <MainHeader>
        <Title>{i18n.t("tags.title")}</Title>
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder={i18n.t("contacts.searchPlaceholder")}
            type="search"
            value={searchParam}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "gray" }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenTagModal}
          >
            {i18n.t("tags.buttons.add")}
          </Button>
          <Can
            role={user.profile}
            perform="drawer-admin-items:view"
            yes={() => (
              <>
                <Tooltip title={i18n.t("tags.buttons.deleteAll")}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={(e) => {
                      setConfirmModalOpen(true);
                      setDeletingAllTag(tags);
                    }}
                  >
                    <DeleteForever
                    className={classes.iconButton}
                    />
                  </Button>
                </Tooltip>
                </>
            )}
          />
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">{i18n.t("tags.table.name")}</TableCell>
              <TableCell align="center">
                {i18n.t("tags.table.tickets")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("tags.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell align="center">
                    <Chip
                      variant="outlined"
                      style={{
                        backgroundColor: tag.color,
                        textShadow: "1px 1px 1px #000",
                        color: "white",
                      }}
                      label={tag.name}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">{tag.ticketsCount}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleEditTag(tag)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setConfirmModalOpen(true);
                        setDeletingTag(tag);
                      }}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={4} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};
export default Tags;
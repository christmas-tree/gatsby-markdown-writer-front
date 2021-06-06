import "easymde/dist/easymde.min.css";
import {useEffect, useMemo, useRef, useState} from "react";
import SimpleMdeReact from "react-simplemde-editor";
import {Alert, Badge, Button, Col, Form} from "react-bootstrap";
import {useHistory, useParams} from 'react-router-dom';
import apiService from "../service/apiService";
import moment from "moment";

const Editor = ({value, onChange, slug}) => {
    const delay = 1000;
    const anOptions = useMemo(() => (
        {
            autosave: {
                enabled: true,
                uniqueId: slug || "new_post",
                delay,
            },
            autofocus: true,
            spellChecker: false,
            uploadImage: true,

        }
    ), [slug]);

    return <SimpleMdeReact value={value} onChange={onChange} options={anOptions}/>;
}

const Tag = ({value, onClick}) => {

    const randomVariant = useMemo(() => {
        const variants = ["primary", "secondary", "success", "danger", "warning", "info", "dark"];
        return variants[Math.floor(Math.random() * (variants.length + 1))];
    }, []);

    return (
        <Badge as={Button}
               pill
               className='mr-1'
               variant={randomVariant}
               key={value}
               onClick={onClick}
               value={value}>
            {value}
        </Badge>
    );
};

const PageEdit = () => {
    const params = useParams();
    const slugParam = params.slug;
    const history = useHistory();
    const formEl = useRef();

    const [content, setContent] = useState('');
    const [tags, setTags] = useState([]);
    const [tempTag, setTempTag] = useState('');
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [cover, setCover] = useState('');
    const [slug, setSlug] = useState(slugParam || '');
    const [oldCoverName, setOldCoverName] = useState('');

    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (!slugParam) {
            const autoSavedValue = localStorage.getItem(`smde_new_post`) || '';
            setContent(autoSavedValue);

            setDate('');
            setTitle('');
            setTags([]);
            setExcerpt('');
            setSlug('');
            setOldCoverName('');
            setTempTag('');

            return;
        }
        apiService.getPost(slugParam)
            .then((resp) => {
                const {data, error} = resp.data;
                setErrorMessage(error);
                if (error) return;

                const date = data.date;
                setDate(moment(date).format(moment.HTML5_FMT.DATETIME_LOCAL));
                setTitle(data.title);
                setTags(data.tags);
                setExcerpt(data.description);
                setSlug(data.slug);
                setOldCoverName(data.cover);

                setContent(data.content);

                const autoSavedValue = localStorage.getItem(`smde_${slugParam}`) || data.content;
                setContent(autoSavedValue);
            })
            .catch((err) => {
                setErrorMessage(err.toString());
            });
    }, [slugParam]);

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
    };

    const handleExcerptChange = (e) => {
        setExcerpt(e.target.value);
    };

    const handleDateChange = (e) => {
        setDate(e.target.value);
    };

    const handleFormKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const validForm = formEl.current.reportValidity();
        if (!validForm) return;

        const data = {
            content,
            tags,
            title,
            excerpt,
            cover,
            slug,
            oldCoverName,
            date: moment(date, moment.HTML5_FMT.DATETIME_LOCAL).toISOString()
        };
        let promise;
        if (slugParam) {
            promise = apiService.savePost(slugParam, data);
        } else {
            promise = apiService.createPost(data);
        }
        window.scrollTo({top: 0, behavior: 'smooth'});
        return promise
            .then((resp) => {
                const {error} = resp.data;
                setErrorMessage(error);
                if (error) return;
                setSuccessMessage('Post saved.');
            })
            .catch((err) => {
                setErrorMessage(err.toString());
            });
    };

    const handleBuildNow = (e) => {
        const promise = handleSubmit();
        if (!promise) return;
        promise
            .then(() => {
                return apiService.triggerJob('deploy')
            })
            .then(({data}) => {
                if (data.error) {
                    throw new Error(data.error);
                }
                history.push('/job');
            })
            .catch((e) => {
                setErrorMessage(e.toString());
            });
    }

    const handleCancel = (e) => {
        history.push('/');
    };

    const handleContentChange = (value) => {
        setContent(value);
    };

    const handleFileChange = (e) => {
        setCover(e.target.files[0]);
        console.log(e);
    }

    const handleSlugChange = (e) => {
        setSlug(e.target.value);
    }

    const handleRemoveTag = (e) => {
        const tagToRemove = e.target.value;
        const removedArr = tags.filter((tag) => tag !== tagToRemove);
        if (removedArr.length === tags.length) return;
        setTags(removedArr);
    }

    const handleTagInputChange = (e) => {
        setTempTag(e.target.value);
    }

    const handleTagInputKeyDown = (e) => {
        if (e.key !== 'Enter') return;
        const newTag = e.target.value.trim();
        if (newTag === '') return;
        if (tags.includes(newTag)) {
            setTempTag('');
            return;
        }
        setTags([...tags, newTag]);
        setTempTag('');
    }

    const acceptedTags = tags.map((tag) => (<Tag value={tag} key={tag} onClick={handleRemoveTag}/>));

    return (
        <div className="my-3">
            <h3 className='my-4'>
                {title ? title : 'Untitled'}
                <small className="text-muted ml-3">Editing</small>
            </h3>
            {errorMessage && (
                <Alert variant="danger">
                    {errorMessage}
                </Alert>
            )}
            {successMessage && (
                <Alert variant="success">
                    {successMessage}
                </Alert>
            )}
            <Form ref={formEl} onSubmit={handleSubmit} onKeyPress={handleFormKeyPress}>
                <Form.Group>
                    <Form.Label>Title</Form.Label>
                    <Form.Control required type="text" onChange={handleTitleChange} value={title}/>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Excerpt</Form.Label>
                    <Form.Control required type="text" onChange={handleExcerptChange} value={excerpt}/>
                </Form.Group>
                <Form.Row>
                    <Form.Group as={Col}>
                        <Form.Label>Slug</Form.Label>
                        <Form.Control required type="text" value={slug} onChange={handleSlugChange}/>
                    </Form.Group>
                    <Form.Group as={Col}>
                        <Form.Label>Date</Form.Label>
                        <Form.Control required type="datetime-local" onChange={handleDateChange} value={date}/>
                    </Form.Group>
                </Form.Row>
                <Form.Row>
                    <Form.Group as={Col}>
                        <Form.Row>
                            <Form.Label>Tags</Form.Label>
                        </Form.Row>
                        <Form.Row className='mb-2'>
                            {acceptedTags}
                        </Form.Row>
                        <Form.Row>
                            <Form.Control type="text"
                                          value={tempTag}
                                          className='w-50'
                                          onKeyDown={handleTagInputKeyDown}
                                          onChange={handleTagInputChange}
                            />
                        </Form.Row>
                    </Form.Group>
                    <Form.Group as={Col}>
                        <Form.Label>Cover</Form.Label>
                        <Form.File onChange={handleFileChange}/>
                    </Form.Group>
                </Form.Row>
                <Form.Group>
                    <Form.Label>Content</Form.Label>
                    <Editor slug={slugParam} value={content} onChange={handleContentChange}/>
                </Form.Group>
                <Form.Row className='justify-content-center'>
                    <Button variant="primary" size="lg" className="mx-1" type="submit">
                        Save
                    </Button>
                    <Button variant="info" size="lg" className="mx-1" type="button" onClick={handleBuildNow}>
                        Build Now
                    </Button>
                    <Button variant="secondary" size="lg" className="mx-1" type="button" onClick={handleCancel}>
                        Cancel
                    </Button>
                </Form.Row>
            </Form>
        </div>
    )
}

export default PageEdit;
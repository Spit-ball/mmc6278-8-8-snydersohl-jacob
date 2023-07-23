const { Post, Tag } = require('../models')
const { find } = require('../models/Post')

async function create(req, res, next) {
  const { title, body, tags } = req.body
  // TODO: create a new post
  // if there is no title or body, return a 400 status
  // omitting tags is OK
  // create a new post using title, body, and tags
  // return the new post as json and a 200 status

  if (!title || !body) {
    return res.status(400).send('Title and body are required')
  }

  try {
    const post = new Post({
      title,
      body,
      tags: tags || []
    });
    await post.save();
    return res.status(200).json(post);
  } catch (err) {
    return next(err);
  }
}

// should render HTML
async function get(req, res) {
  try {
    const slug = req.params.slug
    // TODO: Find a single post
    // find a single post by slug and populate 'tags'
    // you will need to use .lean() or .toObject()
    const post = await Post.findOne({ slug }).populate('tags').lean();

    if (!post) {
      return res.status(404).send('Post not found');
    }


    post.createdAt = new Date(post.createdAt).toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    })
    post.comments.map(comment => {
      comment.createdAt = new Date(comment.createdAt).toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      })
      return comment
    })
    res.render('view-post', { post, isLoggedIn: req.session.isLoggedIn })
  } catch (err) {
    res.status(500).send(err.message)
  }
}

// should render HTML
async function getAll(req, res) {
  try {
    // get by single tag id if included
    const mongoQuery = {}
    if (req.query.tag) {
      const tagDoc = await Tag.findOne({ name: req.query.tag }).lean()
      if (tagDoc)
        mongoQuery.tags = { _id: tagDoc._id }
    }
    const postDocs = await Post
      .find(mongoQuery)
      .populate({
        path: 'tags'
      })
      .sort({ createdAt: 'DESC' })
    const posts = postDocs.map(post => {
      post = post.toObject()
      post.createdAt = new Date(post.createdAt).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
      return post
    })
    res.render('index', {
      posts,
      isLoggedIn: req.session.isLoggedIn,
      tag: req.query.tag
    })
  } catch (err) {
    res.status(500).send(err.message)
  }
}

async function update(req, res) {
  try {
    const { title, body, tags } = req.body;
    const postId = req.params.id;

    // TODO: update a post
    // if there is no title or body, return a 400 status
    // omitting tags is OK
    // find and update the post with the title, body, and tags
    // return the updated post as json
    if (!title) {
      return res.status(400).send('Title Required');
    }

    if (!body) {
      return res.status(400).send('Body Required');
    }

    const updateData = {};

    if (title) {
      updateData.title = title;
    }

    if (body) {
      updateData.body = body;
    }

    // if tags is undefined, I don't want to update the tags
    // if tags is null, I want to set the tags to an empty array
    // otherwise, I want to set the tags to the tags passed in the request
    // This one for some reason was alot to work through, hence the comments above ^
    if (tags !== undefined) {
      if (tags === null) {
        updateData.tags = [];
      } else {
        updateData.tags = tags;
      }
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      updateData,
      { new: true }
    ).lean();

    // if there is no post, I return a 404.
    if (!updatedPost) {
      return res.status(400).send('Post not found');
    }

    return res.status(200).json(updatedPost);

  } catch (err) {
    res.status(500).send(err.message);
  }
}


async function remove(req, res, next) {
  const postId = req.params.id
  // TODO: Delete a post
  // delete post by id, return a 200 status
  try {
    await Post.findByIdAndDelete(postId)
    return res.status(200).send('Post deleted')
  }
  catch (err) {
    return next(err)
  }
}

module.exports = {
  get,
  getAll,
  create,
  update,
  remove
}

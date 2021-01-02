const addPosts = () => {
  const li = document.createElement('ul')

  posts.forEach(post => {
    const listItem = document.createElement('li')
    li.append(listItem)
    listItem.innerHTML = `<a href="post/${post.slug}">${post.title}</a>`
  })

  document.querySelector('#blog').append(li)
}

addPosts()

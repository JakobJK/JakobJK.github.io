const addPosts = () => {
  posts = [
    {
      title: 'AWS Lambda for S3',
      slug: 'aws-lambda-for-s3',
      date: '01/02-2020',
    },
    {
      title: 'Functions in PostgresQL',
      slug: 'functions-in-postgresql',
      date: '01/02-2020',
    },
    {
      title: 'OpenVPN for secure access to Private Subnet',
      slug: 'vpn-private-subnet',
      date: '01/02-2020',
    },
  ]

  const unorderedList = document.createElement('ul')

  posts.forEach(post => {
    const listItem = document.createElement('li')
    unorderedList.append(listItem)
    listItem.innerHTML = `<a href="posts/${post.slug}">${post.title}</a>`
  })

  document.querySelector('#blog').append(unorderedList)
}

addPosts()

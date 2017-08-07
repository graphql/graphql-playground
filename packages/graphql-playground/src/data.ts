export const onboardingQuery1 = `\
{
  allPosts {
    imageUrl
    # description
  }
}`

export const onboardingQuery1Check = `{allPosts{imageUrldescription}}`

export const onboardingEmptyMutation = `\
mutation {
  createPost(
    imageUrl: ""
    description: ""
  ) {
    id
  }
}`

export const onboardingFilledMutation1 = `\
mutation {
  createPost(
    imageUrl: "http://bit.ly/2pLtEdd"
    description: "Cat"
  ) {
    id
  }
}`

export const onboardingFilledMutation2 = `\
mutation {
  createPost(
    imageUrl: "http://bit.ly/2pLDBrf"
    description: "Another Cat"
  ) {
    id
  }
}`

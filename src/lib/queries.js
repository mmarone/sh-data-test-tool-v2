// ==========================================
// GraphQL queries / mutations ทั้งหมด (ย้ายจาก app.js เดิมแบบไม่แก้ไข)
// ==========================================

// ----- Admin (Back Office) -----
export const GRAPHQL_CREATE = `
mutation createOrUpdateCampaign(
  $id: Int, $title: String, $seoSlugUrl: String, $beginDate: String, $endDate: String,
  $isPublish: Boolean, $brandId: Int, $coverImage: InputImage, $sections: [InputSection!],
  $isRequiredImage: Boolean, $maxRegister: Int, $maxQuota: Int, $isApplicationForm: Boolean,
  $startReviewDate: String, $endReviewDate: String, $startRegisterDate: String,
  $startDraftDate: String, $endDraftDate: String, $endRegisterDate: String,
  $isAllowLink: Boolean, $brands: [ListOfBrand!], $questions: [InputBrandCampaignQuestion!],
  $acceptQuestions: [InputBrandCampaignQuestion!], $categories: [InputIntId!],
  $interests: [InputIntId!], $eCatalogIds: [Int!], $startShippingDate: String,
  $suggestedItem: InputBrandCampaignSuggestedItem!, $genCodeSocialType: SocialApplicationType
) {
  createOrUpdateBrandCampaign(
    id:$id, title:$title, seoSlugUrl:$seoSlugUrl, beginDate:$beginDate, endDate:$endDate,
    isPublish:$isPublish, brandId:$brandId, coverImage:$coverImage, sections:$sections,
    isRequiredImage:$isRequiredImage, maxRegister:$maxRegister, maxQuota:$maxQuota,
    isApplicationForm:$isApplicationForm, startReviewDate:$startReviewDate,
    endReviewDate:$endReviewDate, startRegisterDate:$startRegisterDate,
    endRegisterDate:$endRegisterDate, isAllowLink:$isAllowLink, brands:$brands,
    questions:$questions, acceptQuestions:$acceptQuestions, categories:$categories,
    interests:$interests, eCatalogIds:$eCatalogIds, startDraftDate:$startDraftDate,
    endDraftDate:$endDraftDate, startShippingDate:$startShippingDate,
    suggestedItem:$suggestedItem, genCodeSocialType:$genCodeSocialType
  ) {
    successful entity { id __typename }
    errors { path message __typename }
    __typename
  }
}`;

export const GRAPHQL_PUBLISH = `
mutation publishCampaign($id:Int!) {
  publish(id:$id,type:brandCampaign) {
    successful errors { path message __typename } __typename
  }
}`;

export const GRAPHQL_DELETE = `
mutation deleteBrandCampaign($id:Int!) {
  deleteBrandCampaign(id:$id) {
    successful errors { message path __typename } __typename
  }
}`;

export const Q_CATEGORIES = `
query getCategoriesV2($limit:Int,$offset:Int,$type:CategoryV2Type!,$filter:CategoryV2Filter) {
  categoriesV2(limit:$limit,offset:$offset,type:$type,filter:$filter) {
    id name type slug hasChild
    children { id name }
  }
}`;

export const Q_BRANDS = `
query autocompleteBrands($name:String!,$limit:Int,$offset:Int,$filter:BrandFilterOption) {
  searchAllByName(name:$name) {
    brands(filter:{name:$name,filter:$filter},limit:$limit,offset:$offset) {
      id name seoSlugUrl isStore
    }
  }
}`;

export const Q_COUPONS = `
query autocompleteCoupons($limit:Int,$offset:Int,$filter:CouponFilter) {
  coupons(limit:$limit,offset:$offset,filter:$filter) {
    id title seoSlugUrl
    brand { id name seoSlugUrl }
  }
}`;

// ----- Front (เว็บหน้าบ้าน) -----
export const Q_MY_DISPLAY_NAME = `
query MyDisplayName {
  myProfile { displayName }
}
`;

export const Q_STAR_PROFILE_OVERVIEW = `
query StarProfileOverview {
  myProfile {
    id
    displayName
    nickname
    tel
    lineId
    verifyStatus
    categories(limit: 20) { id name }
    socialProfiles {
      type
      followerCount
      photoPrice
      shortVdoPrice
      longVdoPrice
      sharingPrice
    }
    creatorProfile {
      creatorType
      profileImages { image { imgPath } seq }
      portfolio {
        images { image { imgPath } seq }
        videos { videoThumbnail { imgPath } video { videoPath } seq }
      }
      preferredProvinces
      availableTimes {
        day
        timeSlots { timeSlotKey isSelected }
      }
      tel
      lineId
      website
      bodyMeasurement {
        weight { value unit }
        height { value unit }
        chest { value unit }
        waist { value unit }
        hip { value unit }
        shoeSize { value unit }
      }
    }
  }
  myAddress { id address province district subDistrict zipcode }
  myUserVerify { status reason createdDate { short } }
  brandCampaignPayoutProfiles(mode: latest) {
    successful
    entities {
      payoutType
      bankName
      accountNumber
      accountName
    }
  }
  socialProfileInsights {
    socialType
    completed
  }
}`;

export const M_RESET_STAR_PROFILE_FOR_TEST = `
mutation ResetStarProfileForTest($steps: [StarProfileTestStep!]!) {
  resetStarProfileForTest(steps: $steps) {
    successful
    errors {
      message
    }
  }
}`;

export const M_CHANGE_USER_VERIFY_STATE_FOR_TEST = `
mutation ChangeUserVerifyStateForTest($state: UserVerifyTestState!) {
  changeUserVerifyStateForTest(state: $state) {
    successful
    errors {
      message
    }
    entity {
      status
    }
  }
}`;

export const M_CREATE_OR_UPDATE_CREATOR = `
mutation CreateOrUpdateCreatorProfile(
  $bodyMeasurement: InputCreatorBodyMeasurement
  $tel: String
  $showTel: Boolean
  $lineId: String
  $showLineId: Boolean
  $website: String
  $showWebsite: Boolean
  $availableTimes: [InputCreatorAvailableTimes!]
  $preferredProvinces: [String!]
  $profileImages: [InputCreatorImage!]
  $portfolio: InputCreatorPortfolio
  $creatorType: CreatorType
) {
  createOrUpdateCreatorProfile(
    bodyMeasurement: $bodyMeasurement
    tel: $tel
    showTel: $showTel
    lineId: $lineId
    showLineId: $showLineId
    website: $website
    showWebsite: $showWebsite
    availableTimes: $availableTimes
    preferredProvinces: $preferredProvinces
    profileImages: $profileImages
    portfolio: $portfolio
    creatorType: $creatorType
  ) {
    successful
    errors { path message }
  }
}`;

export const M_ANALYZE_SOCIAL_PROFILE_INSIGHT = `
mutation AnalyzeSocialProfileInsight(
  $socialType: SocialProfileType!
  $insightType: SocialInsightType!
  $imageUrl: String!
) {
  analyzeSocialProfileInsight(
    socialType: $socialType
    insightType: $insightType
    imageUrl: $imageUrl
  ) {
    successful
    errors {
      path
      message
    }
    insight {
      socialType
      completed
    }
  }
}`;

export const M_CREATE_SOCIAL_PROFILE = `
mutation CreateSocialProfile(
  $socialType: SocialProfileType!
  $profileUrl: String!
  $followerCount: Int
  $photoPrice: Int
  $shortVdoPrice: Int
  $longVdoPrice: Int
  $sharingPrice: Int
) {
  createSocialProfile(
    socialType: $socialType
    profileUrl: $profileUrl
    followerCount: $followerCount
    photoPrice: $photoPrice
    shortVdoPrice: $shortVdoPrice
    longVdoPrice: $longVdoPrice
    sharingPrice: $sharingPrice
  ) {
    successful
    errors { path message }
  }
}`;

export const M_SET_USER_CATEGORIES = `
mutation SetUserCategories($categories: [InputEntity!]!) {
  setUserCategories(categories: $categories) {
    successful
    errors { path message }
  }
}`;

export const M_EDIT_PROFILE_CAPTION = `
mutation EditProfileCaption($caption: String) {
  editProfile(caption: $caption) {
    successful
    errors { path message }
  }
}`;

export const M_EDIT_PROFILE_NICKNAME = `
mutation EditProfileNickname($nickname: String) {
  editProfile(nickname: $nickname) {
    successful
    errors { path message }
  }
}`;

export const M_UPSERT_PAYOUT = `
mutation UpsertMyPayoutProfile(
  $profileId: String
  $payoutType: UnboxPayoutRecipientType!
  $individual: UnboxPayoutIndividualInput
  $juristic: UnboxPayoutJuristicInput
  $bankBookCopyImage: InputImage
  $bankCode: String!
  $bankName: String!
  $accountNumber: String!
  $accountName: String!
  $useSameAsDocument: Boolean
  $taxAddress: UnboxPayoutTaxAddressInput!
  $phone: String!
  $email: String!
) {
  upsertMyPayoutProfile(
    profileId: $profileId
    payoutType: $payoutType
    individual: $individual
    juristic: $juristic
    bankBookCopyImage: $bankBookCopyImage
    bankCode: $bankCode
    bankName: $bankName
    accountNumber: $accountNumber
    accountName: $accountName
    useSameAsDocument: $useSameAsDocument
    taxAddress: $taxAddress
    phone: $phone
    email: $email
  ) {
    successful
    errors { path message }
  }
}`;

export const M_CREATE_USER_ADDRESS = `
mutation CreateUserAddress(
  $name: String!
  $tel: String!
  $address: String!
  $province: String!
  $district: String!
  $subDistrict: String!
  $zipcode: String!
) {
  createUserAddress(
    name: $name
    tel: $tel
    address: $address
    province: $province
    district: $district
    subDistrict: $subDistrict
    zipcode: $zipcode
  ) {
    successful
    errors { path message }
  }
}`;

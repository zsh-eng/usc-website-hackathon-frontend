import { Box, useToast, useDisclosure } from '@chakra-ui/react'
import {
  getFromUrlArrayAndParseJson,
  getFromUrlStringAndParseJson,
  getFromUrlStringAndParseJsonWithAuth,
  isUserLoggedIn,
  makeFetchToUrlWithAuth,
} from '../../../utils'
import { useUserInfo } from '../../../hooks/useUserInfo'
import useSWR from 'swr'
import useSWRImmutable from 'swr/immutable'
import { useState } from 'react'
import OrganisationControlFormPopup from './OrganisationControlFormPopup'
import defaultValues from './initialValues'
import validationSchema from './validationSchema'
import { makeSuccessOrgToast, makeErrorOrgToast } from '../../../utils/orgUtils'
import AdminTable, { AdminTableColumnProps } from '../AdminTable'

function OrganisationControlForm() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [auth] = useUserInfo()
  const toast = useToast()
  const [initialValues, setInitialValues] = useState<OrganisationForm>(defaultValues)

  const {
    data: users,
    error: errorUsers,
    isLoading: isLoadingUsers,
    mutate: mutateUsers,
  } = useSWR<User[], string[]>(
    auth?.token ? [process.env.NEXT_PUBLIC_BACKEND_URL + 'users', auth.token] : null,
    getFromUrlStringAndParseJsonWithAuth,
  )
  const {
    data: orgs,
    error: errorOrgs,
    isLoading: isLoadingOrgs,
    mutate: mutateOrgs,
  } = useSWR<OrganisationWithIGHead[], string[]>(
    [process.env.NEXT_PUBLIC_BACKEND_URL, 'orgs'],
    getFromUrlArrayAndParseJson,
  )
  const {
    data: allOrgCategories,
    error: errorOrgCategories,
    isLoading: isLoadingOrgCategories,
  } = useSWRImmutable<{ [key: string]: string }, string>(
    process.env.NEXT_PUBLIC_BACKEND_URL + 'orgs/categories',
    getFromUrlStringAndParseJson,
  )

  if (!isUserLoggedIn(auth) || auth === null) {
    return <Box>Please log in first!</Box>
  }

  if (
    isLoadingOrgCategories ||
    isLoadingOrgs ||
    isLoadingUsers ||
    !orgs ||
    !allOrgCategories ||
    !users
  ) {
    return <Box>Fetching data! Spinner</Box>
  }

  if (errorOrgCategories || errorOrgs || errorUsers) {
    throw new Error("Could not fetch organisations' data from the backend")
  }

  console.log(orgs)

  const onSubmit = async (
    values: OrganisationForm,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void },
  ) => {
    // need to parse igHead to number type as HTML option by default will parse the field as string
    const parsedValues = { ...values, igHead: Number(values.igHead) }
    const { responseJson, responseStatus } = await makeFetchToUrlWithAuth(
      process.env.NEXT_PUBLIC_BACKEND_URL + `org/${parsedValues.id}`,
      auth.token,
      'PUT',
      JSON.stringify(parsedValues),
    )

    if (responseStatus === 200) {
      toast(
        makeSuccessOrgToast(
          parsedValues.igHead === -1 ? `Org created successfully!` : `Org edited successfully`,
        ),
      )
      mutateOrgs()
      onClose()
    } else {
      toast(
        makeErrorOrgToast(
          'Oh snap! There was an error when making the org',
          JSON.stringify(responseJson.message),
        ),
      )
    }

    setSubmitting(false)
  }

  const categoryTemp: any = allOrgCategories // parse due to typing issue in backend

  const categories = Object.keys(categoryTemp).map((category: any) => {
    return {
      value: category,
      description: category,
    }
  })

  const mappedUsers = users.map((user: User) => {
    return {
      value: user.id,
      description: user.telegramUserName,
    }
  })

  const openModalWithInitialValues = (initialValues: OrganisationForm) => {
    setInitialValues(initialValues)
    onOpen()
  }

  const convertToOrganisationForm = (org: OrganisationWithIGHead): OrganisationForm => {
    const igHead = org.userOrg.filter((org) => org.isIGHead)[0].user.id
    console.log(igHead, 'igHead')
    const otherMembers = org.userOrg.filter((org) => !org.isIGHead).map((org) => org.user.id)
    return { ...org, igHead, otherMembers }
  }

  const columns: AdminTableColumnProps[] = [
    {
      title: 'Name',
      field: 'name',
    },
    {
      title: 'Category',
      field: 'category',
    },
    {
      title: 'Invite Link',
      field: 'inviteLink',
    },
    {
      title: 'Admin Organisation',
      field: 'isAdminOrg',
      fieldToText: (value: boolean) => (value ? 'Yes' : 'No'),
    },
    {
      title: 'Inactive',
      field: 'isInactive',
      fieldToText: (value: boolean) => (value ? 'Yes' : 'No'),
    },
    {
      title: 'Invisible',
      field: 'isInvisible',
      fieldToText: (value: boolean) => (value ? 'Yes' : 'No'),
    },
  ]

  const onEdit = (rowData: any) => openModalWithInitialValues(convertToOrganisationForm(rowData))
  // const onDelete = (rowData: any) => {}
  const onDelete = async (rowData: any) => {
    const { responseJson, responseStatus } = await makeFetchToUrlWithAuth(
      process.env.NEXT_PUBLIC_BACKEND_URL + 'org/' + rowData.id,
      auth.token,
      'DELETE',
      JSON.stringify(rowData),
    )

    if (responseStatus === 200) {
      toast(makeSuccessOrgToast('Org deleted successfully'))
      mutateOrgs()
    } else {
      toast(
        makeErrorOrgToast(
          'Oh snap! There was an error when deleting the org',
          JSON.stringify(responseJson.message),
        ),
      )
    }
  }
  const onAdd = () => openModalWithInitialValues(defaultValues)
  const headerText = 'Organisations and Interest Groups'
  const addButtonText = 'New Organisation'
  const searchFieldText = 'Search Organisations...'
  const searchFilterField = 'name'
  const itemsPerPage = 10

  return (
    <>
      <AdminTable
        columns={columns}
        searchFilterField={searchFilterField}
        headerText={headerText}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
        addButtonText={addButtonText}
        searchFieldText={searchFieldText}
        data={orgs}
        itemsPerPage={itemsPerPage}
      />
      <OrganisationControlFormPopup
        isOpen={isOpen}
        onClose={onClose}
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        categories={categories}
        users={mappedUsers}
      />
    </>
  )
}

export default OrganisationControlForm

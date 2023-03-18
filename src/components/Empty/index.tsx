import { createStyles, rem } from '@mantine/core'

const useStyles = createStyles((theme) => ({
  label: {
    textAlign: 'center',
    fontWeight: 900,
    fontSize: rem(60),
    lineHeight: 1,
    color: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2],

    [theme.fn.smallerThan('sm')]: {
      fontSize: rem(60),
    },
  },
}))

const Empty = () => {
  const { classes } = useStyles()
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className={classes.label}>Nothing here</div>
    </div>
  )
}

export default Empty

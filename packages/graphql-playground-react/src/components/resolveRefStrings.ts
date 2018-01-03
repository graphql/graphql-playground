export function resolveRefString(str: string, values?: object): string {
  const { strings, rawRefs } = parse(str)
  const refValues = rawRefs.map(ref => resolveRef(ref, values))

  let res = ''
  for (let i = 0; i < refValues.length; i++) {
    res += strings[i]
    res += refValues[i]
  }
  res += strings.pop()
  return res
}

export function resolveEnvsInValues<T extends any>(
  inputConfig: T,
  env: { [name: string]: string | undefined },
): T {
  const config = { ...(inputConfig as any) }
  Object.keys(config).forEach(key => {
    const value = config[key]
    if (typeof value === 'string') {
      config[key] = resolveRefString(value, { env })
    } else if (typeof value === 'object') {
      config[key] = resolveEnvsInValues(value, env)
    }
  })
  return config
}

export function getUsedEnvs(config: any): { [name: string]: string } {
  const result = {}

  const traverse = val => {
    if (typeof val === 'string') {
      const rawRefs = parse(val).rawRefs
      for (const ref of rawRefs) {
        result[parseRef(ref).ref] = resolveRef(ref, {}, false)
      }
    } else if (typeof val === 'object') {
      Object.keys(config).forEach(key => {
        traverse(config[key])
      })
    }
  }
  traverse(config)
  return result
}

function parseRef(rawRef: string): { type: string; ref: string } {
  const [type, ref] = rawRef.split(/\s*:\s*/)
  return { type, ref }
}

function resolveRef(
  rawRef: string,
  values: any = {},
  throwIfUndef: boolean = true,
): string | null {
  const { type, ref } = parseRef(rawRef)

  if (type === 'env') {
    if (!ref) {
      throw new Error(`Reference value is not present for ${type}: ${rawRef}`)
    }

    const refValue = (values.env && values.env[ref]) || process.env[ref]
    if (!refValue) {
      if (throwIfUndef) {
        throw new Error(`Environment variable ${ref} is not set`)
      } else {
        return null
      }
    }
    return refValue
  } else {
    // support only 'env' for now
    throw new Error(
      'Undefined reference type \\$\\{refType}. Only "env" is supported',
    )
  }
}

function parse(str: string): { strings: string[]; rawRefs: string[] } {
  const regex = /\${([^}]*)}/g
  const strings: string[] = []
  const rawRefs: string[] = []

  let prevIdx = 0
  let match
  // tslint:disable-next-line:no-conditional-assignment
  while ((match = regex.exec(str)) !== null) {
    if (match.index > 0 && str[match.index - 1] === '\\') {
      continue
    }

    strings.push(str.substring(prevIdx, match.index))
    rawRefs.push(match[1])
    prevIdx = match.index + match[0].length
  }
  strings.push(str.substring(prevIdx))
  return { strings, rawRefs }
}

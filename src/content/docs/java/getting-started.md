---
title: Getting Started
description: Install the Serverless Workflow Java SDK and read your first workflow.
order: 1
---

# Java SDK — Getting Started

The [Serverless Workflow Java SDK](https://github.com/serverlessworkflow/sdk-java) lets you
read, write, validate and run workflows defined with the
[Serverless Workflow DSL](https://github.com/serverlessworkflow/specification). The `7.x`
stream targets **Specification 1.0.0**.

## Requirements

- Java 17 or later
- Maven 3.8+ or Gradle 7+

## Modules

The SDK is split into focused modules so you only pull in what you need. This guide uses three:

- **`serverlessworkflow-api`** — the "define/read" layer. A hierarchy of POJOs generated from
  the specification schema, rooted at `io.serverlessworkflow.api.types.Workflow`, plus the
  `WorkflowReader`/`WorkflowWriter` helpers to read and write definitions as YAML or JSON. It
  contains no execution logic.
- **`serverlessworkflow-impl-core`** — the "execute" layer: the reference runtime that runs a
  definition. Provides `WorkflowApplication` (the runtime entry point), `WorkflowDefinition`
  (an executable, reusable definition), `WorkflowModel` (the runtime's data abstraction) and the
  built-in task implementations. It is data-format agnostic and needs a concrete `WorkflowModel`
  backend to actually hold and convert data.
- **`serverlessworkflow-impl-jackson`** — the Jackson-based data backend that plugs into
  `impl-core`: it provides the concrete `WorkflowModel` implementation and converts workflow data
  to and from JSON via Jackson.

## Add the dependency

Add the three modules described above to your build. The SDK publishes a **BOM**
(`serverlessworkflow-bom`) that aligns the versions of every module — import it once and you can
drop the `<version>` from each individual dependency, so they can never drift out of sync.

> Check the [sdk-java releases page](https://github.com/open-workflow-specification/sdk-java/releases)
> for the latest published version, and use it wherever a version is needed below.

### Maven

Set the version you found on the releases page as a property, import the BOM in your
`dependencyManagement`, then declare the modules without versions:

```xml
<properties>
    <serverlessworkflow.bom.version>7.32.1.Final</serverlessworkflow.bom.version>
</properties>

<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>io.serverlessworkflow</groupId>
            <artifactId>serverlessworkflow-bom</artifactId>
            <version>${serverlessworkflow.bom.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<dependencies>
    <dependency>
        <groupId>io.serverlessworkflow</groupId>
        <artifactId>serverlessworkflow-api</artifactId>
    </dependency>
    <dependency>
        <groupId>io.serverlessworkflow</groupId>
        <artifactId>serverlessworkflow-impl-core</artifactId>
    </dependency>
    <dependency>
        <groupId>io.serverlessworkflow</groupId>
        <artifactId>serverlessworkflow-impl-jackson</artifactId>
    </dependency>
</dependencies>
```

### Gradle

Use the BOM as a platform, then declare the modules without versions:

```groovy
implementation platform('io.serverlessworkflow:serverlessworkflow-bom:7.32.1.Final')
implementation 'io.serverlessworkflow:serverlessworkflow-api'
implementation 'io.serverlessworkflow:serverlessworkflow-impl-core'
implementation 'io.serverlessworkflow:serverlessworkflow-impl-jackson'
```

## Run your first workflow

Create a `simple.yaml` workflow definition on your classpath (e.g. `src/main/resources/simple.yaml`):

```yaml
document:
  dsl: '1.0.0'
  namespace: default
  name: simple
  version: '1.0.0'
do:
  - hello:
      set:
        message: Hello World
```

This `document` block and `set` task follow the
[Serverless Workflow DSL specification](https://github.com/serverlessworkflow/specification), see it
for the full list of available tasks and syntax.

Then read it, run it and inspect the output:

```java
package io.cncf;

import io.serverlessworkflow.api.WorkflowReader;
import io.serverlessworkflow.api.types.Workflow;
import io.serverlessworkflow.impl.WorkflowApplication;
import io.serverlessworkflow.impl.WorkflowDefinition;
import io.serverlessworkflow.impl.WorkflowModel;

import java.io.IOException;

public class Main {

    public static void main(String ...args) throws IOException {

        Workflow workflow = WorkflowReader.readWorkflowFromClasspath("simple.yaml");
        try (WorkflowApplication app = WorkflowApplication.builder().build()) {
            WorkflowDefinition def = app.workflowDefinition(workflow);
            WorkflowModel output = def.instance().start().join();
            System.out.println("The message is: " + output.asMap().orElseThrow().get("message"));
        }
    }
}
```

## What just happened?

Running the `main()` method, the code reads the definition, executes it and prints `The message is: Hello World`. Here is
what each line does:

- **Line 15 — Read the definition.** `WorkflowReader.readWorkflowFromClasspath` loads `simple.yaml` from the
  classpath and parses it into a `Workflow`, the in-memory object model from the
  `serverlessworkflow-api` module.
- **Line 16 — Create the application.** `WorkflowApplication` is the runtime entry point that holds the
  shared configuration used to run workflows. It is `AutoCloseable`, so the try-with-resources
  block releases its resources when you are done.
- **Line 17 — Build a definition.** `app.workflowDefinition(workflow)` turns the parsed model into an
  executable `WorkflowDefinition` you can run as many times as you like.
- **Line 18 — Run an instance.** `def.instance().start()` starts a new execution and returns a
  `CompletableFuture`; `.join()` waits for it to finish and yields the output as a `WorkflowModel`.
- **Line 19 — Read the output.** the `hello` task set `message` to `Hello World`, so `output.asMap()`
  exposes that value, which we print.

## Recap

In this tutorial, you:

- Added the `serverlessworkflow-api`, `serverlessworkflow-impl-core` and `serverlessworkflow-impl-jackson`
  modules to your build using the `serverlessworkflow-bom`.
- Wrote a `simple.yaml` workflow definition following the Serverless Workflow DSL.
- Used `WorkflowReader` to read the definition from the classpath into a `Workflow` object.
- Built a `WorkflowApplication`, turned the `Workflow` into an executable `WorkflowDefinition`, and ran it to
  produce a `WorkflowModel` output.

---

Thanks for reading. Happy coding! 🚀

